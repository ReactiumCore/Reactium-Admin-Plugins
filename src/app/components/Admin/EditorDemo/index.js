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
 * Toolkit Element: EditorOrganism
 * -----------------------------------------------------------------------------
 */
const registerEditorPlugins = () => {
    const buttonProps = Reactium.RTE.ENUMS.PROPS.BUTTON;
    const iconProps = Reactium.RTE.ENUMS.PROPS.ICON;

    Reactium.RTE.Format.register('test', {
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
    });
};

const EditorOrganism = props => {
    registerEditorPlugins();

    const RichTextEditor = useHookComponent('RichTextEditor');
    const editorRef = useRef();

    const onChange = e => {
        console.log(e.target.value);
    };

    const render = () => {
        return (
            <div style={{ paddingTop: 100, paddingLeft: 150 }}>
                <Helmet>
                    <title>Rich Text Editor</title>
                </Helmet>
                <RichTextEditor ref={editorRef} />
            </div>
        );
    };

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.addEventListener('change', onChange);

            return () => {
                editorRef.current.removeEventListener('change', onChange);
            };
        }
    });

    return render();
};

// Default properties
EditorOrganism.defaultProps = {};

export default EditorOrganism;
