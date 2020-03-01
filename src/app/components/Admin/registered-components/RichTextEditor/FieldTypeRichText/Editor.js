import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, {
    __,
    useFulfilledObject,
    useHookComponent,
} from 'reactium-core/sdk';

export default ({ editor, ...props }) => {
    const {
        fieldName: name,
        label = __('Content'),
        placeholder = __('Enter content'),
    } = props;

    const { slug } = editor;

    const defaultValue = {
        children: [{ type: 'p', children: [{ text: '' }] }],
    };

    const editorRef = useRef();

    const RichTextEditor = useHookComponent('RichTextEditor');

    const [previousSlug, setPreviousSlug] = useState();
    const [value, setNewValue] = useState(editor.value[name] || defaultValue);
    const [hasValue, ready] = useFulfilledObject(editor.value, [name]);

    const setValue = newValue => {
        if (_.isEqual(value, newValue)) return;
        setNewValue(newValue);
    };

    const onEditorChange = e => {
        setValue(e.target.value);
        editor.setValue({ [name]: e.target.value });
    };

    const reload = () => {
        const newValue = editor.value[name];
        editorRef.current.setValue(newValue);
        setPreviousSlug(slug);
        setValue(newValue);
    };

    useEffect(() => {
        if (!ready) return;
        if (!editorRef.current) return;
        if (slug === previousSlug) return;
        reload();
    }, [editorRef.current, ready, slug]);

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
