import React from 'react';
import Panel from './Panel';
import FormatElement from './Element';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';
import RTEPlugin from '../../registered-components/RichTextEditor/RTEPlugin';

const SidebarButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            data-tooltip={__('Component')}
            {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Linear.Beaker'
                size={20}
            />
        </Button>
    );
};

const Plugin = new RTEPlugin({
    type: 'component',
    order: -1000000000,
});

Plugin.callback = editor => {
    const onButtonClick = () => {
        const x = window.innerWidth / 2 - 150;
        editor.panel
            .setID(Plugin.type)
            .setContent(<Panel selection={editor.selection} editor={editor} />)
            .moveTo(x, 50)
            .show();
    };

    // register formats
    Reactium.RTE.Block.register(Plugin.type, {
        element: FormatElement,
    });
    Reactium.RTE.Format.register(`${Plugin.type}Content`, {
        element: ({ children, fieldName, fieldType, type }) => (
            <span data-field={fieldName} data-type={fieldType} className={type}>
                {children}
            </span>
        ),
    });

    // register sidebar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 62,
        sidebar: true,
        button: props => <SidebarButton {...props} onClick={onButtonClick} />,
    });

    const { isInline } = editor;

    editor.isInline = n => (n.type === Plugin.type ? false : isInline(n));

    return editor;
};

export default Plugin;
