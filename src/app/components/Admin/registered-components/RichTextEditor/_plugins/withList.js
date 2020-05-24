import React from 'react';
import _ from 'underscore';
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
    Reactium.RTE.Hotkey.register('list-enter', {
        keys: ['enter'],
        order: 100,
        callback: ({ editor, event }) => {
            const [parent] = Editor.parent(editor, editor.selection);
            const [node] = Editor.node(editor, editor.selection);

            const isEmpty = _.chain([op.get(node, 'text')])
                .compact()
                .isEmpty()
                .value();

            if (!isEmpty) return;

            let type = op.get(parent, 'type');
            type = String(type).toLowerCase();
            type = type === 'paragraph' ? 'p' : type;

            if (type !== 'li') return;

            event.preventDefault();
            Reactium.RTE.toggleBlock(editor, 'p');
            return false;
        },
    });

    Reactium.RTE.Hotkey.register('list-backspace', {
        keys: ['backspace'],
        order: 100,
        callback: ({ editor, event }) => {
            if (!_.first(editor.selection.focus.path) === 0) return;

            const [node] = Editor.node(editor, editor.selection);
            const [line] = Editor.parent(editor, editor.selection);

            const isEmpty = _.chain([op.get(node, 'text')])
                .compact()
                .isEmpty()
                .value();

            const type = op.get(line, 'type');
            const types = ['li', 'ul', 'ol'];

            if (isEmpty) {
                Transforms.unwrapNodes(editor, {
                    match: n => types.includes(n.type),
                });
                Transforms.setNodes(editor, { type: 'div' }, editor.selection);
            }
        },
    });

    Reactium.RTE.Hotkey.register('list-tab', {
        keys: ['tab', 'shift+tab'],
        callback: ({ editor, event }) => {
            const { path } = editor.selection.focus;
            const [node] = Editor.parent(editor, editor.selection);
            const [parent] = Editor.parent(editor, [path[0], 0]);

            const type = op.get(node, 'type');
            const block = parent.type;
            const newType = event.shiftKey
                ? parent.type === 'ol'
                    ? 'ul'
                    : 'ol'
                : parent.type;

            if (type === 'li') {
                event.preventDefault();
                Transforms.wrapNodes(editor, {
                    type: newType,
                    children: [],
                });
            } else {
                if (['ul', 'ol'].includes(type)) return;
                event.preventDefault();
                Reactium.RTE.toggleBlock(editor, newType);
            }

            if (_.first(editor.selection.focus.path) === 0) {
                event.preventDefault();
                if (!event.shiftKey) {
                    Reactium.RTE.toggleBlock(editor, 'ul');
                } else {
                    Reactium.RTE.toggleBlock(editor, 'ol');
                }
                return;
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
