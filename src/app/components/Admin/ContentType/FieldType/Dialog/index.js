import React, { useRef } from 'react';
import { __, useHandle } from 'reactium-core/sdk';
import { Dialog, Icon, Button } from '@atomic-reactor/reactium-ui';
import PropTypes from 'prop-types';
import cn from 'classnames';
import op from 'object-path';
import Enums from '../../enums';

const uuid = require('uuid/v4');

const Header = props => {
    const inputRef = useRef();
    const { type, icon: FieldIcon, fieldName, mode, DragHandle } = props;

    const editClicked = () => {
        inputRef.current.focus();
    };

    return (
        <div className='fieldtype-header'>
            <div className='fieldtype-header-icon'>
                <FieldIcon />
            </div>
            <div className='fieldtype-header-name'>
                <input
                    ref={inputRef}
                    type={'text'}
                    name='fieldName'
                    placeholder={__('Field Name')}
                    className='fieldtype-header-name-input'
                />
                <Button
                    className='fieldtype-header-name-icon'
                    onClick={editClicked}>
                    <span className='sr-only'>{__('Edit')}</span>
                    <Icon.Linear.Pencil />
                </Button>
            </div>
            <DragHandle />
        </div>
    );
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeDialog
 * -----------------------------------------------------------------------------
 */
const FieldTypeDialog = props => {
    const ContentTypeEditor = useHandle('ContentTypeEditor');
    const removeField = op.get(ContentTypeEditor, 'removeField', () => {});
    const { id, type, dialogProps, children } = props;
    const header = {
        elements: [<Header key='header' {...props} />],
    };

    return (
        <Dialog
            {...dialogProps}
            dismissable={true}
            header={header}
            className={cn('fieldtype', `fieldtype-${type}`)}
            onDismiss={() => removeField(id)}>
            {children}
        </Dialog>
    );
};

FieldTypeDialog.propTypes = {
    // uuid/v4
    id: (propValue, key) => {
        const regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
        return regex.test(propValue[key])
            ? null
            : new Error('Expecting id of type uuid/v4');
    },
    mode: PropTypes.oneOf(Object.values(Enums.FIELD_MODES)),
    type: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    dialogProps: PropTypes.shape(Dialog.propTypes),
};

FieldTypeDialog.defaultProps = {
    mode: Enums.FIELD_MODES.NEW,
    type: Enums.TYPES.type,
    icon: Enums.TYPES.TEXT.icon,
    dialogProps: Dialog.defaultProps,
};

export default FieldTypeDialog;
