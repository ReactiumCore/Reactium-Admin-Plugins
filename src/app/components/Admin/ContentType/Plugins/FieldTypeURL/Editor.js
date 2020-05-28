import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const { editor, fieldName, placeholder, required } = props;

    const refs = useRef({}).current;
    const { Button, Checkbox, Icon } = useHookComponent('ReactiumUI');
    const ElementDialog = useHookComponent('ElementDialog');

    const { errors } = editor;
    const replacers = { '%fieldName': fieldName };
    const errorText = op.get(errors, [fieldName, 'message']);
    const className = cn('form-group', { error: !!errorText });

    /*
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
    //                     {errorText && <small>{errorText}</small>}
    */

    const addURL = () => {
        const url = refs.add.value;
        if (!url) return;

        console.log(url);
    };

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20'>
                <div className='input-group'>
                    <input
                        type='text'
                        ref={elm => op.set(refs, 'add', elm)}
                        placeholder={placeholder}
                    />
                    <Button
                        color={Button.ENUMS.COLOR.TERTIARY}
                        onClick={addURL}
                        style={{ width: 41, height: 41, padding: 0 }}>
                        <Icon name='Feather.Plus' size={22} />
                    </Button>
                </div>
            </div>
        </ElementDialog>
    );
};
