/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import _ from 'underscore';
import op from 'object-path';
import EventForm from '../EventForm';
import { Helmet } from 'react-helmet';
import React, { useRef, useState } from 'react';
import { Button } from '@atomic-reactor/reactium-ui';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

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

    const onChange = e => {
        //console.log('onChange', e.value);
    };

    const onEditorChange = e => {
        formRef.current.setValue({ ...value, [name]: e.target.value });
    };

    const onSubmit = e => {
        console.log('onSubmit', formRef.current.value);
    };

    const render = () => {
        return (
            <div style={{ padding: 100 }}>
                <Helmet>
                    <title>Rich Text Editor</title>
                </Helmet>
                <EventForm
                    id={`form-${name}`}
                    onSubmit={onSubmit}
                    onChange={onChange}
                    ref={formRef}
                    value={value}>
                    <RichTextEditor
                        ref={editorRef}
                        value={op.get(value, name)}
                        name={name}
                        onChange={onEditorChange}
                    />
                    <Button type='submit'>Submit</Button>
                </EventForm>
            </div>
        );
    };

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
