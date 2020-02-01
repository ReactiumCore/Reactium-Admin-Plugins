import React from 'react';
import _ from 'underscore';
import op from 'object-path';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Editor, Transforms } from 'slate';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Panel from './Panel';

const onButtonClick = (e, editor) => {
    const btn = e.currentTarget;

    const setActive = e => {
        const { id, visible } = e.target;

        if (id !== 'formatter' || visible === true) {
            e.target.removeEventListener('content', setActive);
            btn.classList.remove('active');
            return;
        }

        if (visible === false) {
            btn.classList.add('active');
            return;
        }
    };

    editor.panel.addEventListener('content', setActive);
    editor.panel
        .setID('formatter')
        .setContent(<Panel selection={editor.selection} />)
        .toggle();
};

const colors = {
    'color-black': '#000000',
    'color-gray-dark': '#333333',
    'color-gray': '#999999',
    'color-grey': '#CFCFCF',
    'color-grey-light': '#F7F7F7',
    'color-white': '#FFFFFF',
    'color-white-dark': '#FDFDFD',
    'color-yellow': '#F4F19C',
    'color-orange': '#E69840',
    'color-pink': '#D877A0',
    'color-red': '#E09797',
    'color-purple': '#7A7CEF',
    'color-blue': '#4F82BA',
    'color-green': '#659A3F',
    'color-green-light': '#B2BB50',
};

const Plugin = new RTEPlugin({ type: 'formatter', order: 100 });

Plugin.callback = editor => {
    // register buttons
    Reactium.RTE.Button.register(Plugin.type, {
        order: 0,
        sidebar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                onClick={e => onButtonClick(e, editor)}
                {...props}>
                <Icon {...Reactium.RTE.ENUMS.PROPS.ICON} name='Feather.Type' />
            </Button>
        ),
    });

    Reactium.RTE.Button.register('align-left', {
        order: 0,
        formatter: 'alignment',
        button: props => (
            <Button {...props}>
                <Icon name='Feather.AlignLeft' />
            </Button>
        ),
    });

    Reactium.RTE.Button.register('align-center', {
        order: 0,
        formatter: 'alignment',
        button: props => (
            <Button {...props}>
                <Icon name='Feather.AlignCenter' />
            </Button>
        ),
    });

    Reactium.RTE.Button.register('align-justify', {
        order: 0,
        formatter: 'alignment',
        button: props => (
            <Button {...props}>
                <Icon name='Feather.AlignJustify' />
            </Button>
        ),
    });

    Reactium.RTE.Button.register('align-right', {
        order: 0,
        formatter: 'alignment',
        button: props => (
            <Button {...props}>
                <Icon name='Feather.AlignRight' />
            </Button>
        ),
    });

    // register blocks
    Reactium.RTE.Block.register('p', {
        order: 0,
        formatter: true,
        label: 'Paragraph',
        size: 16,
        element: props => <p {...props} />,
    });

    Reactium.RTE.Block.register('h1', {
        order: 1,
        formatter: true,
        label: 'Heading 1',
        size: 32,
        element: props => <h1 {...props} />,
    });

    Reactium.RTE.Block.register('h2', {
        order: 2,
        formatter: true,
        label: 'Heading 2',
        size: 24,
        element: props => <h2 {...props} />,
    });

    Reactium.RTE.Block.register('h3', {
        order: 3,
        formatter: true,
        label: 'Heading 3',
        size: 18,
        element: props => <h3 {...props} />,
    });

    Reactium.RTE.Block.register('h4', {
        order: 4,
        formatter: true,
        label: 'Heading 4',
        size: 16,
        element: props => <h4 {...props} />,
    });

    Reactium.RTE.Block.register('h5', {
        order: 5,
        formatter: true,
        label: 'Heading 5',
        size: 14,
        element: props => <h5 {...props} />,
    });

    Reactium.RTE.Block.register('h6', {
        order: 6,
        formatter: true,
        label: 'Heading 6',
        size: 12,
        element: props => <h6 {...props} />,
    });

    Reactium.RTE.Block.register('blockquote', {
        order: 10,
        formatter: true,
        label: 'Quote',
        size: 16,
        element: props => <blockquote {...props} />,
    });

    // register fonts
    Reactium.RTE.Font.register('font-1', {
        label: 'Montserrat',
        size: [10, 12, 14, 16, 18, 24, 32, 44, 56, 64, 72, 96],
        weight: [
            {
                weight: 100,
                label: 'Thin',
                family: 'Montserrat, Helvetica, Arial, sans-serif',
            },
            {
                weight: 200,
                label: 'Extra Light',
                family: '"Montserrat Thin", Helvetica, Arial, sans-serif',
            },
            {
                weight: 300,
                label: 'Light',
                family: '"Montserrat Light", Helvetica, Arial, sans-serif',
            },
            {
                weight: 400,
                label: 'Regular',
                family: '"Montserrat Regular", Helvetica, Arial, sans-serif',
            },
            {
                weight: 500,
                label: 'Medium',
                family: '"Montserrat Medium", Helvetica, Arial, sans-serif',
            },
            {
                weight: 600,
                label: 'Semi-Bold',
                family: '"Montserrat SemiBold", Helvetica, Arial, sans-serif',
            },
            {
                weight: 800,
                label: 'Bold',
                family: '"Montserrat Bold", Helvetica, Arial, sans-serif',
            },
            {
                weight: 900,
                label: 'Black',
                family: '"Montserrat Black", Helvetica, Arial, sans-serif',
            },
        ],
    });

    Reactium.RTE.Font.register('font-2', {
        label: 'Cardo',
        size: [10, 12, 14, 16, 18, 24, 32, 44, 56, 64, 72, 96],
        weight: [
            {
                weight: 400,
                label: 'Regular',
                family: 'Cardo, "Times New Roman", Gotham, serif',
            },
            {
                weight: 600,
                label: 'Semi-Bold',
                family: 'Cardo, "Times New Roman", Gotham, serif',
            },
            {
                weight: 800,
                label: 'Bold',
                family: 'Cardo, "Times New Roman", Gotham, serif',
            },
        ],
    });

    Reactium.RTE.Font.register('font-3', {
        label: 'Arial',
        size: [10, 12, 14, 16, 18, 24, 32, 44, 56, 64, 72, 96],
        weight: [
            { weight: 400, label: 'Regular', family: 'Arial, sans-serif' },
            { weight: 600, label: 'Semi-Bold', family: 'Arial, sans-serif' },
            { weight: 800, label: 'Bold', family: 'Arial, sans-serif' },
        ],
    });

    Reactium.RTE.Font.register('font-4', {
        label: 'Helvetica',
        size: [10, 12, 14, 16, 18, 24, 32, 44, 56, 64, 72, 96],
        weight: [
            {
                weight: 400,
                label: 'Regular',
                family: 'Helvetica, Arial, sans-serif',
            },
            {
                weight: 600,
                label: 'Semi-Bold',
                family: 'Helvetica, Arial, sans-serif',
            },
            {
                weight: 800,
                label: 'Bold',
                family: 'Helvetica, Arial, sans-serif',
            },
        ],
    });

    Reactium.RTE.Font.register('font-5', {
        label: 'Courier',
        size: [10, 12, 14, 16, 18, 24, 32, 44, 56, 64, 72, 96],
        weight: [
            {
                weight: 400,
                label: 'Regular',
                family: '"Courier New", Courier, monospace',
            },
            {
                weight: 600,
                label: 'Semi-Bold',
                family: '"Courier New", Courier, monospace',
            },
            {
                weight: 800,
                label: 'Bold',
                family: '"Courier New", Courier, monospace',
            },
        ],
    });

    // register colors
    Object.entries(colors).forEach(([key, value]) =>
        Reactium.RTE.Color.register(key, { value, label: value }),
    );

    // register hotkeys
    Reactium.RTE.Hotkey.register('clearformats', {
        keys: ['backspace', 'enter'],
        callback: ({ editor, event }) => {
            const [node, path] = Editor.node(editor, editor.selection);
            const text = op.get(node, 'text');
            const isEmpty = _.chain([text])
                .compact()
                .isEmpty()
                .value();

            if (!isEmpty) return;

            const [parent] = Editor.parent(editor, editor.selection);

            const selection = {
                anchor: { path, offset: 0 },
                focus: { path, offset: 0 },
            };

            let type = op.get(parent, 'type');
            type = type === 'paragraph' ? 'p' : type;
            type = String(type).toLowerCase();

            if (!type) return;

            const list = ['ol', 'ul', 'li'];
            const types = ['blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
            const isType = types.includes(type);

            Transforms.unwrapNodes(editor, {
                match: n => list.includes(n.type),
            });

            if (isType) {
                event.preventDefault();

                Transforms.setNodes(
                    editor,
                    { type: 'p', style: {} },
                    { at: selection },
                );
            } else {
                Transforms.setSelection(editor, { styles: {} });
            }
        },
    });

    // Extend editor
    editor.lastLine = () => [editor.children.length - 1, 0];
    editor.focusEnd = () => Transforms.select(editor, Editor.end(editor, []));

    return editor;
};

export default Plugin;
