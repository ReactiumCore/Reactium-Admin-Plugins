import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import { useHookComponent } from 'reactium-core/sdk';

export const Editor = props => {
    const { editor, fieldName } = props;
    const value = op.get(editor.value, fieldName);
    const ElementDialog = useHookComponent('ElementDialog');
    const options = () => _.sortBy(Object.values(props.options), 'index');

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

                    const defaultValue = op.get(value, key) || val;

                    switch (type) {
                        case 'textarea':
                            return (
                                <div
                                    className='form-group'
                                    key={`${fieldName}-${key}`}>
                                    <textarea
                                        data-key={key}
                                        defaultValue={defaultValue}
                                        name={`${fieldName}.${key}`}
                                        placeholder={placeholder}
                                        rows={6}
                                    />
                                </div>
                            );
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
                                        defaultValue={defaultValue}
                                    />
                                </div>
                            );
                    }
                })}
            </div>
        </ElementDialog>
    );
};
