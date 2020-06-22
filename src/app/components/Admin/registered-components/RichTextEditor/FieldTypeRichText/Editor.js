import _ from 'underscore';
import op from 'object-path';
import { Icon } from '@atomic-reactor/reactium-ui';
import React, { useEffect, useRef, useState } from 'react';
import { __, useFulfilledObject, useHookComponent } from 'reactium-core/sdk';

const defaultValue = {
    children: [{ type: 'p', children: [{ text: '' }] }],
};

export default props => {
    let { editor, fieldName: name, label, placeholder } = props;

    label = label || __('Content');
    placeholder = placeholder || __('Enter content...');

    const { slug } = editor;

    const valueRef = useRef(op.get(editor.value, [name], defaultValue));

    const editorRef = useRef();

    const RichTextEditor = useHookComponent('RichTextEditor');

    const [previousSlug, setPreviousSlug] = useState();
    const [value, setNewValue] = useState(valueRef.current);
    const [ready] = useFulfilledObject(editor.value, [name]);

    const setValue = newValue => {
        if (newValue === null) {
            valueRef.current = null;
        } else {
            newValue = { ...valueRef.current, ...newValue };
            valueRef.current = newValue;
        }
        updateValue();
    };

    const onEditorChange = e => setValue(e.target.value);

    const _updateValue = () => {
        setNewValue(valueRef.current);
        editor.setDirty();
    };

    const updateValue = _.throttle(_updateValue, 1500, { leading: false });

    const reload = e => {
        const newValue = e
            ? op.get(e, ['value', name])
            : op.get(editor, ['value', name], defaultValue);

        editorRef.current.setValue(newValue);
        setPreviousSlug(slug);
        setValue(newValue);
    };

    const onSave = e => op.set(e.value, name, valueRef.current);

    useEffect(() => {
        if (!ready) return;
        if (!editorRef.current) return;
        if (slug === previousSlug) return;
        reload();
    }, [editorRef.current, ready, slug]);

    useEffect(() => {
        if (!editor) return;
        editor.addEventListener('load', reload);
        editor.addEventListener('before-save', onSave);

        return () => {
            editor.removeEventListener('load', reload);
            editor.removeEventListener('before-save', onSave);
        };
    }, [editor]);

    const render = () => {
        return (
            <section className={editor.cx('rte')}>
                <header>
                    <div className='icon'>
                        <Icon name='Feather.Feather' />
                    </div>
                    <h2>{label}</h2>
                </header>
                <div className='editor'>
                    <RichTextEditor
                        ref={editorRef}
                        value={value}
                        name={name}
                        onChange={onEditorChange}
                        placeholder={placeholder}
                    />
                </div>
                <div className='line' />
            </section>
        );
    };

    return render();
};
