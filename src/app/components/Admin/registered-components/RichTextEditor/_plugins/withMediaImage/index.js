import React from 'react';
import _ from 'underscore';
import Panel from './Panel';
import cn from 'classnames';
import op from 'object-path';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Editor, Transforms } from 'slate';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import { ReactEditor, useEditor, useSelected } from 'slate-react';

const Plugin = new RTEPlugin({ type: 'image', order: 50 });

Plugin.callback = editor => {
    // register format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ ID, children, src }) => {
            const editor = useEditor();
            const selected = useSelected();

            const getSelection = () => {
                const nodes = Array.from(Editor.nodes(editor, { at: [] }));

                if (nodes.length < 1) return;

                let output;

                for (let i = 0; i < nodes.length; i++) {
                    const [node, selection] = nodes[i];
                    if (!op.has(node, 'children')) continue;
                    const c = _.findIndex(node.children, { ID });

                    if (c > -1) {
                        selection.push(c);
                        output = selection;
                    }
                }

                return output;
            };

            const onDelete = e => {
                e.preventDefault();
                const selection = getSelection();
                Transforms.removeNodes(editor, { at: selection });
                ReactEditor.focus(editor);
            };

            return (
                <span
                    id={ID}
                    className={cn({ selected })}
                    tabIndex={1}
                    type='embed'
                    contentEditable={false}>
                    {children}
                    <img src={src} contentEditable={false} />
                    <span className='actions'>
                        <Button
                            appearance='circle'
                            color='danger'
                            onClick={onDelete}
                            size='sm'
                            type='button'>
                            <Icon name='Feather.X' />
                        </Button>
                    </span>
                </span>
            );
        },
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 51,
        sidebar: true,
        button: props => {
            const editor = useEditor();
            const onButtonClick = e => {
                const btn = e.currentTarget;
                const rect = btn.getBoundingClientRect();
                let { x, y, width } = rect;

                x += width;

                editor.panel
                    .setID('image')
                    .setContent(<Panel />)
                    .moveTo(x, y)
                    .show();
            };

            return (
                <Button
                    {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                    onClick={onButtonClick}
                    {...props}>
                    <Icon name='Feather.Camera' size={20} />
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
