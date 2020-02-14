/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import _ from 'underscore';
import op from 'object-path';
import EventForm from '../EventForm';
import { Helmet } from 'react-helmet';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useHookComponent } from 'reactium-core/sdk';
import React, { useMemo, useEffect, useRef, useState } from 'react';

/**
 * -----------------------------------------------------------------------------
 * Toolkit Element: EditorDemo
 * -----------------------------------------------------------------------------
 */
const EditorDemo = ({ name, ...props }) => {
    const editorRef = useRef();
    const formRef = useRef();
    const [editor, setEditor] = useState();
    const [value, setValue] = useState(props.value);
    const RichTextEditor = useHookComponent('RichTextEditor');

    const onChange = e => console.log('onChange', e.value);
    const onRTEChange = e =>
        formRef.current.setValue({ ...value, [name]: e.target.value });
    const onSubmit = e => console.log('onSubmit', formRef.current.value);

    const render = () => {
        return (
            <div style={{ padding: 100 }}>
                <Helmet>
                    <title>Rich Text Editor</title>
                </Helmet>
                <EventForm
                    onSubmit={onSubmit}
                    onChange={onChange}
                    ref={formRef}
                    value={value}>
                    <RichTextEditor
                        ref={editorRef}
                        value={op.get(value, name)}
                        name={name}
                    />
                    <Button type='submit'>Submit</Button>
                </EventForm>
            </div>
        );
    };

    useEffect(() => {
        if (!editorRef.current || !editor) return;

        editorRef.current.addEventListener('change', onRTEChange);

        return () => {
            editorRef.current.removeEventListener('change', onRTEChange);
        };
    });

    return render();
};

// Default properties
EditorDemo.defaultProps = {
    value: {
        rte: {
            children: [
                {
                    type: 'p',
                    children: [{ text: 'Reactium Admin Rich Text Editor' }],
                },
            ],
        },
    },
    name: 'rte',
};

export default EditorDemo;
