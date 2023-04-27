import React, { useEffect, useRef } from 'react';
import _ from 'underscore';
import op from 'object-path';
import { useHookComponent, useRefs, __ } from 'reactium-core/sdk';

export const Editor = props => {
    const { editor, fieldName } = props;
    const value = op.get(editor.value, fieldName);
    const ElementDialog = useHookComponent('ElementDialog');
    const MediaTool = useHookComponent('MediaTool');
    const options = () => _.sortBy(Object.values(props.options), 'index');

    const refs = useRefs();

    // MediaTool expects a React.createRef() / useRef()
    options().forEach(({ key, type }) => {
        if (type === 'media' && !refs.get(`media.${key}`))
            refs.set(`media.${key}`, React.createRef());
    });

    const clean = e => {
        const editorValue = op.get(e.value, [fieldName], {});
        _.defer(() => {
            options().forEach(({ key, type }) => {
                if (type === 'media') {
                    const value = op.get(editorValue, [key]);
                    const ref = refs.get(`media.${key}`);
                    if (ref.current) {
                        if (value) {
                            ref.current.setValue([value]);
                        } else {
                            ref.current.setValue([]);
                        }
                    }
                }
            });
        });
    };

    const beforeSave = e => {
        options().forEach(({ key, type }) => {
            if (type === 'media') {
                const ref = refs.get(`media.${key}`);
                if (ref.current) {
                    const media = ref.current;
                    const [value] = media.selection(media.value);
                    op.set(e.value, [fieldName, key], value);
                }
            }
        });
    };

    useEffect(() => {
        editor.addEventListener('clean', clean);
        editor.addEventListener('save-success', clean);
        editor.addEventListener('before-save', beforeSave);
        return () => {
            editor.removeEventListener('clean', clean);
            editor.removeEventListener('save-success', clean);
            editor.removeEventListener('before-save', beforeSave);
        };
    }, [editor]);

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
                                    <label>{key}</label>
                                    <textarea
                                        data-key={key}
                                        defaultValue={defaultValue}
                                        name={`${fieldName}.${key}`}
                                        placeholder={placeholder}
                                        rows={6}
                                    />
                                </div>
                            );
                        case 'media':
                            return (
                                <div
                                    className='form-group'
                                    key={`${fieldName}-${key}`}>
                                    <label>{key}</label>
                                    <div className='media-input'>
                                        <MediaTool
                                            ref={refs.get(`media.${key}`)}
                                            pickerOptions={{
                                                title: __('Pick %key').replace(
                                                    '%key',
                                                    key,
                                                ),
                                                maxSelect: 1,
                                                filters: ['IMAGE'],
                                            }}
                                            directory={'objects'}
                                            value={[]}
                                        />
                                    </div>
                                </div>
                            );
                        default:
                            return (
                                <div
                                    className='form-group'
                                    key={`${fieldName}-${key}`}>
                                    <label>{key}</label>
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
