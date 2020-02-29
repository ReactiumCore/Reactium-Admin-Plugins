import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

export default ({ editor, ...props }) => {
    const {
        fieldName: name,
        label = 'Content',
        placeholder = 'Enter content',
    } = props;

    const defaultValue = {
        children: [{ type: 'p', children: [{ text: '' }] }],
    };

    const editorRef = useRef();

    const RichTextEditor = useHookComponent('RichTextEditor');

    const [value, setValue] = useState(editor.value[name] || defaultValue);

    const onEditorChange = e => {
        if (e.target.value === value) return;
        setValue(e.target.value);
    };

    useEffect(() => {
        editor.setValue({ [name]: value });
    }, [value]);

    const render = () => {
        return (
            <section className={editor.cx('rte')}>
                <header>
                    <div className='icon'>
                        <Icon name='Feather.Feather' />
                    </div>
                    <h2>{__(label)}</h2>
                </header>
                <div className='editor'>
                    <RichTextEditor
                        ref={editorRef}
                        value={value}
                        name={name}
                        onChange={onEditorChange}
                        placeholder={__(placeholder)}
                    />
                </div>
            </section>
        );
    };

    return render();
};
