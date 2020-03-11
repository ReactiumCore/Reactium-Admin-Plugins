import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, {
    __,
    useFulfilledObject,
    useHookComponent,
} from 'reactium-core/sdk';

export default props => {
    let editor = props.editor;
    let { fieldName: name, label, placeholder } = props;

    label = label || __('Content');
    placeholder = placeholder || __('Enter content...');

    const { slug } = editor;

    const defaultValue = {
        children: [{ type: 'p', children: [{ text: '' }] }],
    };

    const currentValue = op.get(editor, ['value', name], defaultValue);

    const editorRef = useRef();

    const RichTextEditor = useHookComponent('RichTextEditor');

    const [previousSlug, setPreviousSlug] = useState();
    const [value, setNewValue] = useState(currentValue);
    const [ready] = useFulfilledObject(editor.value, [name]);

    const setValue = newValue => {
        if (_.isEqual(value, newValue)) return;
        setNewValue(newValue);
    };

    const _onEditorChange = e => {
        const newValue = op.get(e.target, 'value', defaultValue);
        setValue(newValue);
        editor.setValue({ [name]: newValue });
    };

    const onEditorChange = _.throttle(_onEditorChange, 500, { leading: false });

    const reload = e => {
        const newValue = e
            ? op.get(e, ['value', name])
            : op.get(editor, ['value', name], defaultValue);

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

    useEffect(() => {
        editor.addEventListener('load', reload);

        return () => {
            editor.removeEventListener('load', reload);
        };
    });

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
