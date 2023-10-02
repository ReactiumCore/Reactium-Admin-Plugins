import _ from 'underscore';
import op from 'object-path';
import { ListInput } from './ListInput';
import { PointerInput } from './PointerInput';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useRefs, useHookComponent } from '@atomic-reactor/reactium-core/sdk';

export const Editor = (props) => {
    const refs = useRefs({ arrays: {} });
    const { editor, fieldName } = props;
    const ElementDialog = useHookComponent('ElementDialog');
    const { FormRegister, Toggle } = useHookComponent('ReactiumUI');

    const options = useMemo(
        () => _.sortBy(Object.values(props.options), 'index'),
        [props.options],
    );

    const onPointerChange = (key) => (e) => {
        const value = _.isArray(e.value) ? _.first(e.value) : e.value;
        editor.Form.setValue(`${fieldName}.${key}`, value);
    };

    const onSubmit = useCallback((e) => {
        const lists = refs.get('arrays') || {};
        Object.entries(lists).forEach(([k, elm]) => {
            const fieldName = String(props.fieldName).startsWith('meta.')
                ? props.fieldName
                : `data.${props.fieldName}.${k}`;

            op.set(e.value, fieldName, elm.value);
        });
    }, []);

    useEffect(() => {
        editor.addEventListener('submit', onSubmit);
        return () => {
            editor.removeEventListener('submit', onSubmit);
        };
    }, [editor]);

    return options.map((item) => {
        const { key, placeholder, type, value: defaultValue } = item;

        const name = `${fieldName}.${key}`;

        const id = `${fieldName}-${key}-input`;

        const v = editor.isNew
            ? defaultValue
            : op.get(editor.Form.value, [fieldName, key], null);

        return (
            <ElementDialog
                {...props}
                key={`${id}-dialog`}
                fieldName={`${fieldName} / ${key}`}
            >
                <FormRegister>
                    <div className='p-xs-20'>
                        <div
                            className='form-group'
                            style={{ position: 'relative' }}
                        >
                            {type === 'string' && (
                                <textarea
                                    id={id}
                                    name={name}
                                    defaultValue={v || ''}
                                    placeholder={placeholder}
                                />
                            )}
                            {type === 'number' && (
                                <div className='flex-sm-middle'>
                                    <label
                                        className='col-xs-12 col-sm-10'
                                        htmlFor={id}
                                        style={{ fontWeight: 400 }}
                                    >
                                        {placeholder}
                                    </label>
                                    <div className='col-xs-12 col-sm-2 mt-xs-8 mt-sm-0'>
                                        <input
                                            id={id}
                                            name={name}
                                            type='number'
                                            defaultValue={v || ''}
                                            style={{
                                                width: '100%',
                                                textAlign: 'right',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            {type === 'array' && (
                                <ListInput
                                    {...item}
                                    value={v}
                                    editor={editor}
                                    fieldName={fieldName}
                                    ref={(elm) =>
                                        refs.set(`arrays.${key}`, elm)
                                    }
                                />
                            )}
                            {type === 'boolean' && (
                                <Toggle
                                    name={name}
                                    value={true}
                                    defaultChecked={v}
                                    label={placeholder}
                                />
                            )}
                        </div>
                        {type === 'pointer' && (
                            <PointerInput
                                {...item}
                                {...props}
                                value={v}
                                fieldName={name}
                                onChange={onPointerChange(key)}
                                collection={op.get(props, [
                                    'options',
                                    key,
                                    'value',
                                ])}
                            />
                        )}
                    </div>
                </FormRegister>
            </ElementDialog>
        );
    });
};
