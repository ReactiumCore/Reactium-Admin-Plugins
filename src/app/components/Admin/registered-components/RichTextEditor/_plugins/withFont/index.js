import Panel from './Panel';
import op from 'object-path';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import React, { useEffect, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const Plugin = new RTEPlugin({ type: 'font', order: 100 });

Plugin.callback = editor => {
    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ type, ...props }) => <span {...props} />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 53,
        toolbar: true,
        button: props => {
            const editor = useSlate();
            const [fontFamily, setFontFamily] = useState();
            const [fontSize, setFontSize] = useState();
            const [fontWeight, setFontWeight] = useState();
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

                const _fontFamily = op.get(node, 'style.fontFamily');
                const _fontSize = op.get(node, 'style.fontSize');
                const _fontWeight = op.get(node, 'style.fontWeight');

                if (!_fontFamily || !_fontSize || !_fontWeight) return;

                if (fontFamily !== _fontFamily) setFontFamily(_fontFamily);
                if (fontSize !== _fontSize) setFontSize(_fontSize);
                if (fontWeight !== _fontWeight) setFontWeight(_fontWeight);
            }, [node]);

            return (
                <Button
                    {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                    active={
                        op.has(node, 'style.fontFamily') ||
                        op.has(node, 'style.fontSize') ||
                        op.has(node, 'style.fontWeight')
                    }
                    onClick={onButtonClick}
                    {...props}>
                    <span className='ico'>F</span>
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
