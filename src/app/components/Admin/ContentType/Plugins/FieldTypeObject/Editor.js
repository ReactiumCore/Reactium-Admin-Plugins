import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { __, useDerivedState, useHookComponent } from 'reactium-core/sdk';

export const Editor = props => {
    const { editor, fieldName } = props;

    const ElementDialog = useHookComponent('ElementDialog');

    const [state, setState] = useDerivedState({
        options: props.options || {},
    });

    const options = () => _.sortBy(Object.values(state.options), 'index');

    const replacers = {
        '%fieldName': fieldName,
    };

    const onChange = e => {
        const { options } = state;
        const { value = '' } = e.currentTarget;
        const { key } = e.currentTarget.dataset;
        op.set(options, [key, 'value'], value);
        setState({ options });
    };

    useEffect(() => {
        //editor.addEventListener('validate', validate);
        return () => {
            //editor.removeEventListener('validate', validate);
        };
    }, [editor]);

    const render = () => {
        const value = op.get(editor.value, fieldName);

        return (
            <ElementDialog {...props}>
                <div className='p-xs-20'>
                    {options().map(item => {
                        const {
                            key,
                            placeholder,
                            type = 'text',
                            value: val = '',
                        } = item;

                        switch (type) {
                            default:
                                return (
                                    <div
                                        className='form-group'
                                        key={`${fieldName}-${key}`}>
                                        <input
                                            data-key={key}
                                            name={`${fieldName}.${key}`}
                                            placeholder={placeholder}
                                            type={type}
                                            defaultValue={
                                                op.get(value, key) || val
                                            }
                                        />
                                    </div>
                                );
                        }
                    })}
                </div>
            </ElementDialog>
        );
    };
    return render();
};
