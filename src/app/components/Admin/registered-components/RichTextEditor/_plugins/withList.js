import React from 'react';
import op from 'object-path';
import { Editor, Transforms } from 'slate';
import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const onButtonClick = (e, editor) => {
    const block = e.currentTarget.dataset.type;
    e.preventDefault();
    Reactium.RTE.toggleBlock(editor, block);
};

const Plugin = new RTEPlugin({ type: 'list', order: 100 });

Plugin.callback = editor => {
    // register block elements
    Reactium.RTE.Block.register('ol', {
        element: props => <ol {...props} />,
    });

    Reactium.RTE.Block.register('ul', {
        element: props => <ul {...props} />,
    });

    Reactium.RTE.Block.register('li', {
        element: props => <li {...props} />,
    });

    // register toolbar buttons
    Reactium.RTE.Button.register('ol', {
        order: 160,
        formatter: true,
        toolbar: true,
        sidebar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                data-type='ol'
                active={Reactium.RTE.isBlockActive(editor, 'ol')}
                onClick={e => onButtonClick(e, editor)}
                {...props}>
                <Icon {...Reactium.RTE.ENUMS.PROPS.ICON} name='Linear.List2' />
            </Button>
        ),
    });

    Reactium.RTE.Button.register('ul', {
        order: 160,
        formatter: true,
        toolbar: true,
        sidebar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                data-type='ul'
                active={Reactium.RTE.isBlockActive(editor, 'ul')}
                onClick={e => onButtonClick(e, editor)}
                {...props}>
                <Icon
                    {...Reactium.RTE.ENUMS.PROPS.ICON}
                    size={22}
                    name='Feather.List'
                />
            </Button>
        ),
    });

    // register hotkeys
    Reactium.RTE.Hotkey.register('clearlist', {
        keys: ['backspace', 'enter'],
        callback: ({ editor, event }) => {
            const [node] = Editor.node(editor, editor.selection);
            const [parent] = Editor.parent(editor, editor.selection);

            const text = op.get(node, 'text');
            const type = op.get(parent, 'type');

            if (type === 'li' && String(text).length < 1) {
                event.preventDefault();
                Reactium.RTE.toggleBlock(editor, 'p');
            }
        },
    });

    Reactium.RTE.Hotkey.register('tablist', {
        keys: ['tab', 'shift+tab'],
        callback: ({ editor, event }) => {
            const { path } = editor.selection.focus;
            const [node] = Editor.parent(editor, editor.selection);
            const [parent] = Editor.parent(editor, [path[0], 0]);

            const type = op.get(node, 'type');
            const block = parent.type;

            if (type === 'li') {
                event.preventDefault();
                Transforms.wrapNodes(editor, {
                    type: block,
                    children: [],
                });
            } else {
                if (['ul', 'ol'].includes(type)) return;
                event.preventDefault();
                if (event.shiftKey) {
                    Reactium.RTE.toggleBlock(editor, 'ol');
                } else {
                    Reactium.RTE.toggleBlock(editor, 'ul');
                }
            }
        },
    });

    // editor overrides
    editor.insertList = type => {
        const node = {
            type,
            children: [{ type, children: [{ text: '' }] }],
        };
        editor.insertNode(node);
    };

    return editor;
};

export default Plugin;
