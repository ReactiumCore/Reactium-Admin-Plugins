import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import uuid from 'uuid/v4';
import { Editor, Node, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import RTEPlugin from '../RTEPlugin';
import Reactium, { __ } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const insertNode = (editor, type) => {
    const [current, path] = Editor.above(editor);

    const list = listNode(editor, path);
    if (list) return;

    if (path.length < 3 || op.get(current, 'data.column')) {
        Transforms.wrapNodes(editor, {
            blocked: true,
            className: 'full',
            id: `block-${uuid()}`,
            type: 'block',
        });
    }

    Transforms.wrapNodes(editor, { type });

    if (op.get(current, 'type') !== 'li') {
        Transforms.wrapNodes(editor, { type: 'li' });
    }
};

const listNode = (editor, path) => {
    const types = ['li'];
    const node = _.first(
        Array.from(
            Node.ancestors(editor, path, {
                reverse: true,
            }),
        ).filter(([node]) => {
            if (Editor.isEditor(node)) return false;
            if (!op.get(node, 'type')) return false;

            const type = op.get(node, 'type');
            return Boolean(types.includes(type));
        }),
    );

    return node ? _.object(['node', 'path'], node) : undefined;
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
    Reactium.RTE.Button.register('ul', {
        order: 162,
        sidebar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                data-type='ul'
                active={Reactium.RTE.isBlockActive(editor, 'ul')}
                onClick={() => insertNode(editor, 'ul')}
                data-tooltip={__('List')}
                data-align='center'
                data-vertical-align='middle'
                {...props}>
                <Icon
                    {...Reactium.RTE.ENUMS.PROPS.ICON}
                    size={22}
                    name='Feather.List'
                />
            </Button>
        ),
    });

    Reactium.RTE.Button.register('ol', {
        order: 164,
        sidebar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                data-type='ol'
                active={Reactium.RTE.isBlockActive(editor, 'ol')}
                onClick={() => insertNode(editor, 'ol')}
                data-tooltip={__('Ordered List')}
                data-align='center'
                data-vertical-align='middle'
                {...props}>
                <Icon {...Reactium.RTE.ENUMS.PROPS.ICON} name='Linear.List2' />
            </Button>
        ),
    });

    // register hotkeys
    Reactium.RTE.Hotkey.register('list-enter', {
        keys: ['enter'],
        order: 100,
        callback: ({ editor, event }) => {
            let current = Editor.above(editor);
            current = _.object(['node', 'path'], current);

            const listItem = listNode(editor, current.path);

            if (!listItem) return;

            event.preventDefault();

            const next = Path.next(listItem.path);
            Transforms.insertNodes(
                editor,
                { type: 'li', children: [{ text: '' }] },
                { at: next },
            );
            Transforms.select(editor, next);
            ReactEditor.focus(editor);
        },
    });

    Reactium.RTE.Hotkey.register('list-tab', {
        keys: ['tab', 'shift+tab'],
        callback: ({ editor, event }) => {
            if (event.shiftKey) {
                let current = Editor.above(editor);
                current = _.object(['node', 'path'], current);

                const listItem =
                    op.get(current.node, 'type') === 'li'
                        ? current
                        : listNode(editor, current.path);

                if (!listItem) return;

                event.preventDefault();

                const types = ['ul', 'ol'];
                const ancestors = Array.from(
                    Node.ancestors(editor, listItem.path, { reverse: true }),
                )
                    .filter(([node]) => {
                        if (Editor.isEditor(node)) return false;
                        if (!op.get(node, 'type')) return false;

                        const type = op.get(node, 'type');
                        return Boolean(types.includes(type));
                    })
                    .map(item => _.object(['node', 'path'], item));

                if (ancestors.length === 1) {
                    const list = _.first(ancestors);

                    let parent = Editor.above(editor, { at: list.path });
                    parent = _.object(['node', 'path'], parent);

                    Transforms.unwrapNodes(editor, {
                        at: parent.path,
                        mode: 'all',
                        match: node => {
                            if (Editor.isEditor(node)) return false;
                            if (!op.get(node, 'type')) return false;
                            const type = op.get(node, 'type');
                            return ['ul', 'ol', 'li'].includes(type);
                        },
                    });
                } else {
                    Transforms.liftNodes(editor, { at: listItem.path });
                }
            } else {
                event.preventDefault();
                insertNode(editor, 'ul');
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
