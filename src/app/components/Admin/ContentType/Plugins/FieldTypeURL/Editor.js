import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const { defaultValue, editor, fieldName, placeholder, required } = props;

    const inputRef = useRef();
    const { Checkbox } = useHookComponent('ReactiumUI');
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
