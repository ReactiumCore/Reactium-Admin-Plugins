import React, { useRef } from 'react';
import { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import { Dialog, Icon, Button } from '@atomic-reactor/reactium-ui';
import PropTypes from 'prop-types';
import cn from 'classnames';
import op from 'object-path';
import Enums from '../../enums';
// import Dialog from 'components/Reactium-UI/Dialog';

const Header = props => {
    const inputRef = useRef();
    const { id, icon: FieldIcon, DragHandle } = props;
    const CTE = useHandle('ContentTypeEditor');
    const error = CTE.getFormErrors(id);

    // const value = op.get(props, 'formRef.current.getValue')();
    const saved = CTE.saved();
    const fieldSaved = op.has(saved, ['fields', id]) || id === 'publisher';

    const savedProps = fieldSaved
        ? {
              readOnly: true,
          }
        : {
              onTouchStart: e => inputRef.current.select(),
              onClick: e => inputRef.current.select(),
          };

    const render = () => (
        <div className='fieldtype-header'>
            <div className='fieldtype-header-icon'>
                <FieldIcon />
            </div>
            <div
                className={cn('fieldtype-header-name', {
                    error: op.get(error, 'fieldName'),
                })}>
                <input
                    ref={inputRef}
                    type={'text'}
                    name='fieldName'
                    placeholder={__('Field Name')}
                    {...savedProps}
                    className={cn('fieldtype-header-name-input', {
                        disabled: fieldSaved,
                    })}
                />
                {!fieldSaved && (
                    <Button
                        className='fieldtype-header-name-icon'
                        {...savedProps}>
                        <span className='sr-only'>{__('Edit')}</span>
                        <Icon.Linear.Pencil />
                    </Button>
                )}
            </div>
            <DragHandle />
        </div>
    );

    return render();
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeDialog
 * -----------------------------------------------------------------------------
 */
const FieldTypeDialog = props => {
    const dialogRef = useRef();
    const CTE = useHandle('ContentTypeEditor');
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    const ConfirmBox = useHookComponent('ConfirmBox');
    const removeField = op.get(CTE, 'removeField', () => {});
    const isNew = op.get(CTE, 'isNew', () => true);
    const { id, type, dialogProps, children } = props;
    const header = { elements: [<Header key={`${id}-header`} {...props} />] };

    const pref = isNew()
        ? {}
        : {
              pref: `field-type-dialog.${id}`,
          };

    const doRemoveField = () => removeField(id);

    const onConfirm = () => {
        doRemoveField();
        Modal.hide();
    };

    const showModal = () =>
        Modal.show(
            <ConfirmBox
                message={__(
                    'Are you sure? This may be a destructive operation on save.',
                )}
                onCancel={() => {
                    dialogRef.current.show();
                    Modal.hide();
                }}
                onConfirm={onConfirm}
                title={__('Delete Field')}
            />,
        );

    const onDismiss = op.has(CTE.saved(), ['fields', id])
        ? showModal
        : doRemoveField;

    return (
        <Dialog
            ref={dialogRef}
            {...dialogProps}
            {...pref}
            dismissable={true}
            header={header}
            className={cn('fieldtype', `fieldtype-${type}`)}
            onDismiss={onDismiss}>
            {
                // <div>id: {id}</div>
            }
            {children}
            <div className='form-group'>
                {op.get(props, 'showHelpText') && (
                    <label>
                        <input
                            type='text'
                            name='helpText'
                            placeholder={__('Help Text')}
                        />
                    </label>
                )}
            </div>
        </Dialog>
    );
};

FieldTypeDialog.propTypes = {
    // uuid/v4
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    dialogProps: PropTypes.shape(Dialog.propTypes),
    showHelpText: PropTypes.bool,
};

FieldTypeDialog.defaultProps = {
    showHelpText: true,
};

export default FieldTypeDialog;
