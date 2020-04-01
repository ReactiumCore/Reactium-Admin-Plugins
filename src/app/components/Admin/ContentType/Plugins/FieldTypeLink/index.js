import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';
import { Checkbox, Dialog } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeLink
 * -----------------------------------------------------------------------------
 */
export const FieldType = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-link'>
                <div className='input-group'>
                    <label className='default-value'>
                        <span className='sr-only'>{__('Default Value')}</span>
                        <input
                            type='text'
                            name='defaultValue'
                            placeholder={__('Default Value')}
                        />
                    </label>
                    <label className='placeholder'>
                        <span className='sr-only'>{__('Placeholder')}</span>
                        <input
                            type='text'
                            name='placeholder'
                            placeholder={__('Placeholder')}
                        />
                    </label>
                    <div className='required'>
                        <Checkbox
                            name='required'
                            label={__('Required')}
                            labelAlign='right'
                            value={1}
                        />
                    </div>
                </div>
            </div>
        </FieldTypeDialog>
    );
};

export const Editor = props => {
    const { defaultValue, editor, fieldName, placeholder, required } = props;

    const inputRef = useRef();
    const ElementDialog = useHookComponent('ElementDialog');

    const inputProps = {
        defaultValue,
        name: fieldName,
        placeholder,
        ref: inputRef,
        type: 'text',
    };

    const { errors } = editor;
    const replacers = { '%fieldName': fieldName };
    const errorText = op.get(errors, [fieldName, 'message']);
    const className = cn('form-group', { error: !!errorText });

    const validate = ({ context, value }) => {
        const v = value[fieldName];

        const err = {
            field: fieldName,
            focus: inputRef.current,
            message: null,
            value: v,
        };

        if (required === true) {
            if (!v) {
                err.message = __('%fieldName is a required');
            }
        }

        if (err.message !== null) {
            err.message = editor.parseErrorMessage(err.message, replacers);
            context.error[fieldName] = err;
            context.valid = false;
        }

        return context;
    };

    useEffect(() => {
        editor.addEventListener('validate', validate);
        return () => {
            editor.removeEventListener('validate', validate);
        };
    }, [editor]);

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20'>
                <div className={className}>
                    <label>
                        <span className='sr-only'>
                            {placeholder || fieldName}
                        </span>
                        <input {...inputProps} />
                    </label>
                    {errorText && <small>{errorText}</small>}
                </div>
            </div>
        </ElementDialog>
    );
};

export const Comparison = props => {
    const field = op.get(props, 'field', {});
    const value = op.get(props, 'value');
    const { fieldName: title } = field;

    return (
        <Dialog header={{ title }} collapsible={false}>
            <div className='p-xs-20' style={{ minHeight: '60px' }}>
                {value ? value : null}
            </div>
        </Dialog>
    );
};
