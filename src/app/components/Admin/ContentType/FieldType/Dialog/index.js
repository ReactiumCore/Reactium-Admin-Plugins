import React, { useRef } from 'react';
import { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import { Dialog, Icon, Button } from '@atomic-reactor/reactium-ui';
import PropTypes from 'prop-types';
import cn from 'classnames';
import op from 'object-path';
import Enums from '../../enums';

const Header = props => {
    const inputRef = useRef();
    const { id, icon: FieldIcon, DragHandle } = props;
    const handle = useHandle('ContentTypeEditor');
    const errors = handle.getFormErrors(id);

    const editClicked = () => {
        inputRef.current.select();
    };

    const value = op.get(props, 'formRef.current.getValue')();
    const saved = handle.saved();
    const fieldSaved = op.has(saved, ['fields', id]);

    const savedProps = fieldSaved
        ? {
              readOnly: true,
              value: op.get(saved, ['fields', id, 'fieldName']),
          }
        : {};
    const unsavedProps = !fieldSaved
        ? {
              defaultValue: op.get(
                  value,
                  'fieldName',
                  op.get(props, 'defaultValues.fieldName'),
              ),
          }
        : {};

    const render = () => (
        <div className='fieldtype-header'>
            <div className='fieldtype-header-icon'>
                <FieldIcon />
            </div>
            <div
                className={cn('fieldtype-header-name', {
                    error: op.get(errors, 'fields', []).includes('fieldName'),
                })}>
                <input
                    ref={inputRef}
                    type={'text'}
                    name='fieldName'
                    placeholder={__('Field Name')}
                    onTouchStart={e => e.target.select()}
                    onClick={e => e.target.select()}
                    className={cn('fieldtype-header-name-input', {
                        disabled: fieldSaved,
                    })}
                    {...unsavedProps}
                    {...savedProps}
                />
                {!fieldSaved && (
                    <Button
                        className='fieldtype-header-name-icon'
                        onClick={editClicked}>
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
    const ContentTypeEditor = useHandle('ContentTypeEditor');
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    const ConfirmBox = useHookComponent('ConfirmBox');
    const removeField = op.get(ContentTypeEditor, 'removeField', () => {});
    const isNew = op.get(ContentTypeEditor, 'isNew', () => true);
    const { id, type, dialogProps, children } = props;
    const header = { elements: [<Header key='header' {...props} />] };

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

    const onDismiss = op.has(ContentTypeEditor.saved(), ['fields', id])
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
            {children}
            <div className='form-group'>
                {op.get(props, 'showHelpText', true) && (
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
};

export default FieldTypeDialog;
