import React from 'react';
import Panel from './Panel';
import RTEPlugin from '../../RTEPlugin';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';
import { Editor, Transforms } from 'slate';

const Plugin = new RTEPlugin({ type: 'icon', order: 100 });

Plugin.callback = editor => {
    const onButtonClick = e => {
        e.preventDefault();

        const x = window.innerWidth / 2 - 75;
        const y = window.innerHeight / 2 - 100;
        editor.panel
            .setID(Plugin.type)
            .setContent(<Panel selection={editor.selection} />)
            .moveTo(x, y)
            .show();
    };

    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ id, children, icon, size }) => {
            const { Button, Icon } = useHookComponent('ReactiumUI');
            const getNode = () => {
                const nodes = Array.from(Editor.nodes(editor, { at: [] }));
                nodes.reverse();

                if (nodes.length < 1) return;

                const result = nodes.reduce((output, [node, selection]) => {
                    if (!op.get(node, 'id')) return output;
                    if (op.get(node, 'id') === id && !output) {
                        output = { node, selection };
                    }

                    return output;
                }, null);

                return result ? result : { node: null, selection: [] };
            };

            const _delete = () => {
                Transforms.collapse(editor, { edge: 'end' });

                const { node, selection } = getNode();
                if (node && selection.length > 0) {
                    Transforms.delete(editor, { at: selection });
                }
            };

            return (
                <span className='rte-icon'>
                    <Icon name={icon} size={size} id={id} />
                    <Button
                        contentEditable={false}
                        color='danger'
                        className='delete-btn'
                        style={{ width: size, height: size }}
                        onClick={_delete}>
                        <Icon name='Feather.X' />
                    </Button>
                    {children}
                </span>
            );
        },
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 61,
        sidebar: true,
        button: props => {
            const { Button, Icon } = useHookComponent('ReactiumUI');
            return (
                <Button
                    {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                    onClick={onButtonClick}
                    data-tooltip={__('Insert Icon')}
                    {...props}>
                    <Icon
                        {...Reactium.RTE.ENUMS.PROPS.ICON}
                        name='Feather.Star'
                        size={22}
                    />
                </Button>
            );
        },
    });

    // editor overrides
    const { isInline } = editor;

    editor.isInline = n => (n.type === Plugin.type ? true : isInline(n));

    return editor;
};

export default Plugin;
