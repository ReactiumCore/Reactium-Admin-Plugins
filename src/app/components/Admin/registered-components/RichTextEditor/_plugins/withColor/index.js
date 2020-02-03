import Panel from './Panel';
import op from 'object-path';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import React, { useEffect, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const Plugin = new RTEPlugin({ type: 'color', order: 100 });

Plugin.callback = editor => {
    const onButtonClick = (e, editor) => {
        const btn = e.currentTarget;

        let { x, y } = editor.toolbar.container.current.getBoundingClientRect();

        const setActive = e => {
            return true;
        };

        editor.panel.addEventListener('content', setActive);
        editor.panel
            .setID('color')
            .setContent(<Panel selection={editor.selection} />)
            .moveTo(x, y)
            .show();
    };

    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ type, ...props }) => <span {...props} />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 160,
        toolbar: true,
        button: props => {
            const editor = useSlate();
            const [backgroundColor, setBGColor] = useState('#000000');
            const [node, setNode] = useState();
            const [selection, setSelection] = useState();

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
                if (!op.get(node, 'style.color')) {
                    setBGColor('#000000');
                    return;
                }
                setBGColor(node.style.color);
            }, [node]);

            return (
                <Button
                    {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                    active={op.has(node, 'style.color')}
                    onClick={onButtonClick}
                    {...props}>
                    <div
                        className='color-circle'
                        style={{ backgroundColor }}
                        data-color={backgroundColor}
                    />
                </Button>
            );
        },
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = element =>
        element.type === Plugin.type ? true : isInline(element);

    return editor;
};

export default Plugin;
