//import Panel from './Panel';
import op from 'object-path';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import React, { useEffect, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const Plugin = new RTEPlugin({ type: 'img', order: 50 });

Plugin.callback = editor => {
    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ type, ...props }) => <img {...props} />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 51,
        sidebar: true,
        toolbar: true,
        button: props => {
            const editor = useSlate();
            const [url, setURL] = useState();
            const [node, setNode] = useState();
            const [selection, setSelection] = useState();

            const onButtonClick = e => {
                const btn = e.currentTarget;
                const rect = editor.toolbar.container.current.getBoundingClientRect();
                let { x, y } = rect;

                /*
                editor.panel
                    .setID('color')
                    .setContent(<Panel selection={editor.selection} url={url} />)
                    .moveTo(x, y)
                    .show();
                */
            };

            useEffect(() => {
                if (!op.get(editor, 'selection')) return;
                setSelection(editor.selection);
            }, [editor.selection]);

            useEffect(() => {
                if (!selection) return;
                const [_node] = Editor.parent(editor, selection);
                setNode(_node);
            }, [selection]);

            useEffect(() => {
                if (op.get(node, 'plugins')) return;
                const _url = op.get(node, url);
                if (!_url || _url === url) return;
                setURL(_url);
            }, [node]);

            return (
                <Button
                    {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                    active={op.has(node, 'url')}
                    onClick={onButtonClick}
                    {...props}>
                    <Icon name='Linear.Picture' size={18} />
                </Button>
            );
        },
    });

    // Editor overrides
    const { isVoid } = editor;
    editor.isVoid = element =>
        element.type === Plugin.type ? true : isVoid(element);

    return editor;
};

export default Plugin;
