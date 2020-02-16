import React from 'react';
import Panel from './Panel';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const Plugin = new RTEPlugin({ type: 'icon', order: 100 });

Plugin.callback = editor => {
    const onButtonClick = e => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        let { x, y, width } = rect;

        x += width;

        editor.panel
            .setID(Plugin.type)
            .setContent(<Panel />)
            .moveTo(x, y)
            .show();
    };

    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ ID, children, color, name, size, type, ...props }) => (
            <>
                <Icon name={name} size={size} color={color} id={ID} />
                {children}
            </>
        ),
    });
    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 61,
        sidebar: true,
        button: props => {
            return (
                <Button
                    {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                    onClick={onButtonClick}
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

    return editor;
};

export default Plugin;
