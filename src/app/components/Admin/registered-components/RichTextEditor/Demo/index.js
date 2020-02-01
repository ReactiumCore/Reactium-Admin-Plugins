/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import op from 'object-path';
import _ from 'underscore';
import { Helmet } from 'react-helmet';
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

const EditorDemo = props => {
    const editorRef = useRef();
    const [editor, setEditor] = useState();
    const RichTextEditor = useHookComponent('RichTextEditor');

    const onChange = e => {
        // console.log(e.target.value);
    };

    const render = () => {
        return (
            <div style={{ padding: 100 }}>
                <Helmet>
                    <title>Rich Text Editor</title>
                </Helmet>
                <RichTextEditor ref={editorRef} value={props.value} />
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
};

export default EditorDemo;
