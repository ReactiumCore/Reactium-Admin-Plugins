/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import op from 'object-path';
import _ from 'underscore';
import { Helmet } from 'react-helmet';
import EventForm from '../EventForm';
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Toolkit Element: EditorDemo
 * -----------------------------------------------------------------------------
 */
const testFormat = () => {
    const buttonProps = Reactium.RTE.ENUMS.PROPS.BUTTON;
    const iconProps = Reactium.RTE.ENUMS.PROPS.ICON;

    const plugin = {
        id: 'test',
        order: 0,
        toolbar: true,
        leaf: props => <span {...props} className='blue' />,
        button: ({ editor, ...props }) => (
            <Button
                {...buttonProps}
                active={Reactium.RTE.isMarkActive(editor, 'test')}
                onClick={e => Reactium.RTE.toggleMark(editor, 'test', e)}
                {...props}>
                <Icon {...iconProps} name='Linear.Link' />
            </Button>
        ),
    };

    return plugin;
};

const EditorDemo = ({ name, ...props }) => {
    const editorRef = useRef();
    const formRef = useRef();
    const [editor, setEditor] = useState();
    const [value, setValue] = useState(props.value);
    const RichTextEditor = useHookComponent('RichTextEditor');

    const onEditorChange = e => {
        const newValue = { ...value, [name]: e.target.value };
        //setValue(newValue);
        formRef.current.setValue(newValue);
    };

    const onChange = e => {
        console.log('onChange', e.value);
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

        editorRef.current.addEventListener('change', onEditorChange);

        return () => {
            editorRef.current.removeEventListener('change', onEditorChange);
        };
    });

    useEffect(() => {
        if (!editorRef.current) return;
        if (!editor) {
            setEditor(editorRef.current.editor);
        }
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
