import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

export const Editor = props => {
    const {
        defaultValue = null,
        editor,
        fieldName,
        placeholder,
        required,
        options = [],
    } = props;

    const inputRef = useRef();
    const ElementDialog = useHookComponent('ElementDialog');

    const inputProps = {
        defaultValue,
        name: fieldName,
        ref: inputRef,
        placeholder,
    };

    const { errors } = editor;
    const errorText = op.get(errors, [fieldName, 'message']);
    const className = cn('form-group', { error: !!errorText });
    const replacers = {
        '%fieldName': fieldName,
    };

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
                        <select {...inputProps}>
                            <option value='null'>
                                {placeholder || 'Select'}
                            </option>
                            {options.map(({ label, value }, i) => (
                                <option key={`option-${i}`} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </label>
                    {errorText && <small>{errorText}</small>}
                </div>
            </div>
        </ElementDialog>
    );
};
