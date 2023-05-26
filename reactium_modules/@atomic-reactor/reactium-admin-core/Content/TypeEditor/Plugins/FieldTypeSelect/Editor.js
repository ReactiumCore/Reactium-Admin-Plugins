import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { __, useHookComponent } from '@atomic-reactor/reactium-core/sdk';

export const Editor = (props) => {
    const {
        defaultValue = null,
        editor,
        fieldName,
        placeholder,
        required,
        options = [],
        multiple,
    } = props;

    const inputRef = useRef();
    const { Toggle } = useHookComponent('ReactiumUI');
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

    const onSave = (e) => {
        const val = op.get(e.value, fieldName);
        const formatted =
            multiple === true
                ? _.chain([val]).flatten().compact().value()
                : val;

        op.set(e.value, fieldName, formatted);
    };

    useEffect(() => {
        editor.addEventListener('validate', validate);
        editor.addEventListener('before-save', onSave);
        return () => {
            editor.removeEventListener('validate', validate);
            editor.removeEventListener('before-save', onSave);
        };
    }, [editor]);

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20'>
                <div className={className}>
                    {!multiple ? (
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
                    ) : (
                        <div className='row' style={{ width: '100%' }}>
                            {options.map(({ label, value }, i) => (
                                <div
                                    key={`${inputProps.name}-checkbox-${i}`}
                                    className='col-xs-12 py-xs-8'
                                >
                                    <Toggle
                                        name={inputProps.name}
                                        labelAlign='left'
                                        value={value}
                                        label={label}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {errorText && <small>{errorText}</small>}
                </div>
            </div>
        </ElementDialog>
    );
};
