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
    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ type, ...props }) => <span {...props} />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 50,
        toolbar: true,
        button: props => {
            const editor = useSlate();
            const [backgroundColor, setBGColor] = useState('#000000');
            const [node, setNode] = useState();
            const [selection, setSelection] = useState();

            const onButtonClick = e => {
                const btn = e.currentTarget;
                const rect = editor.toolbar.container.current.getBoundingClientRect();

                let { width, height, x, y } = rect;

                x += width / 2 - 150;
                y += height;

                editor.panel
                    .setID('color')
                    .setContent(<Panel selection={editor.selection} />)
                    .moveTo(x, y)
                    .show();
            };

            useEffect(() => {
                if (!op.get(editor, 'selection')) return;
                setSelection(editor.selection);
            }, [editor.selection]);

            useEffect(() => {
                if (!selection) return;
                try {
                    const [_node] = Editor.parent(editor, selection);
                    if (_node) setNode(_node);
                } catch (err) {}
            }, [selection]);

            useEffect(() => {
                if (op.get(node, 'plugins')) return;
                const clr = op.get(node, 'style.color');
                if (!clr) {
                    setBGColor('#000000');
                    return;
                }
                setBGColor(clr);
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
