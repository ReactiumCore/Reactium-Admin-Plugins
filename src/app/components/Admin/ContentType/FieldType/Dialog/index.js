import React, { useRef } from 'react';
import { __, useDerivedState } from 'reactium-core/sdk';
import { Dialog, Icon, Button } from '@atomic-reactor/reactium-ui';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Enums from '../../enums';

const uuid = require('uuid/v4');

const Header = props => {
    const inputRef = useRef();
    const { fieldType, Icon: FieldIcon, fieldName, mode } = props;

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
        </div>
    );
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeDialog
 * -----------------------------------------------------------------------------
 */
const FieldTypeDialog = props => {
    const { fieldType, dialogProps, children } = props;
    const header = {
        elements: [<Header key='header' {...props} />],
    };

    return (
        <Dialog
            {...dialogProps}
            dismissable={true}
            header={header}
            className={cn('fieldtype', `fieldtype-${fieldType}`)}>
            {children}
        </Dialog>
    );
};

FieldTypeDialog.propTypes = {
    // uuid/v4
    id: (propValue, key) => {
        const regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
        return regex.test(propValue[key]);
    },
    // mode: PropTypes.oneOf(Object.values(Enums.MODE)),
    fieldType: PropTypes.string.isRequired,
    Icon: PropTypes.elementType.isRequired,
    dialogProps: PropTypes.shape(Dialog.propTypes),
};

FieldTypeDialog.defaultProps = {
    // mode: Enums.MODE.NEW,
    fieldType: 'text',
    Icon: Enums.TYPES.TEXT.icon,
    dialogProps: Dialog.defaultProps,
};

export default FieldTypeDialog;
