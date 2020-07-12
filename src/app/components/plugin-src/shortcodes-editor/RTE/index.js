import React from 'react';
import Panel from './Panel';
import op from 'object-path';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

const SidebarButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button {...Reactium.RTE.ENUMS.PROPS.BUTTON} {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Linear.Puzzle'
                size={20}
            />
        </Button>
    );
};

const FormatElement = ({ shortcode, ...props }) => {
    const type = Reactium.Shortcode.Component.get(shortcode.type);

    let EditorComponent;

    if (op.get(type, 'editorComponent')) {
        EditorComponent = useHookComponent(type.editorComponent);
    }

    if (!EditorComponent) {
        EditorComponent = props => (
            <span>
                <span {...props} contentEditable={false} />
            </span>
        );
    }

    return <EditorComponent {...props} />;
};

const Plugin = Reactium.RTE.pluginFactory({
    type: 'shortcode',
    order: 100,
});

Plugin.callback = editor => {
    const onButtonClick = e => {
        const btn = e.currentTarget;
        let { x, y, width } = btn.getBoundingClientRect();

        x += width;

        editor.panel
            .setID(Plugin.type)
            .setContent(<Panel selection={editor.selection} />)
            .moveTo(x, y)
            .show();
    };

    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: FormatElement,
    });

    // register sidebar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 62,
        sidebar: true,
        button: props => <SidebarButton {...props} onClick={onButtonClick} />,
    });

    // register hotkey

    const { isInline } = editor;

    editor.isInline = n => (n.type === Plugin.type ? true : isInline(n));

    return editor;
};

export default Plugin;
