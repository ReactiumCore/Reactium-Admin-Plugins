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
    const [value, setValue] = useState({ [name]: props.value });
    const RichTextEditor = useHookComponent('RichTextEditor');

    const onChange = e => {
        setValue({ [name]: e.target.value });
    };

    useEffect(() => {
        if (!formRef.current) return;
        if (formRef.current.value !== value) {
            formRef.current.setValue(value);
        }
    }, [value]);

    const render = () => {
        return (
            <div style={{ padding: 100 }}>
                <Helmet>
                    <title>Rich Text Editor</title>
                </Helmet>
                <EventForm
                    onChange={e => console.log(e.value.rte.children)}
                    ref={formRef}
                    value={value}>
                    <RichTextEditor
                        ref={editorRef}
                        value={props.value}
                        name={name}
                        onChange={onChange}
                    />
                </EventForm>
            </div>
        );
    };

    useEffect(() => {
        if (!editorRef.current || !editor) return;

        editorRef.current.addEventListener('change', onChange);

        return () => {
            editorRef.current.removeEventListener('change', onChange);
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
    value: [
        {
            type: 'p',
            children: [{ text: 'Reactium Admin Rich Text Editor' }],
        },
    ],
    name: 'rte',
};

export default EditorDemo;
