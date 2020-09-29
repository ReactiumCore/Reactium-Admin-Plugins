import React from 'react';
import Panel from './Panel';
import op from 'object-path';
import FormatElement from './Element';
import Reactium, { useHookComponent } from 'reactium-core/sdk';
import RTEPlugin from '../../registered-components/RichTextEditor/RTEPlugin';

import SDK from '../sdk';

const SidebarButton = props => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Button {...Reactium.RTE.ENUMS.PROPS.BUTTON} {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Feather.Box'
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
    const onButtonClick = e => {
        const btn = e.currentTarget;
        let { x, y, width } = btn.getBoundingClientRect();

        x += width;
        y = Math.floor(window.innerHeight / 4);

        editor.panel
            .setID(Plugin.type)
            .setContent(<Panel selection={editor.selection} editor={editor} />)
            .moveTo(x, y)
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
        order: 60,
        sidebar: true,
        button: props => <SidebarButton {...props} onClick={onButtonClick} />,
    });

    const { isInline } = editor;

    editor.isInline = n => (n.type === Plugin.type ? false : isInline(n));

    return editor;
};

export default Plugin;
