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
            .setContent(<Panel selection={editor.selection} />)
            .moveTo(x, y)
            .show(false);
    };

    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ ID, children, color, icon, size, type, ...props }) => (
            <span {...props} className='rte-icon'>
                <span contentEditable={false}>
                    <Icon
                        name={icon}
                        size={size}
                        style={{ fill: color, marginBottom: size / 2 }}
                        id={ID}
                    />
                </span>
                {children}
            </span>
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

    // editor overrides
    const { isInline } = editor;

    editor.isInline = n => (n.type === Plugin.type ? true : isInline(n));

    return editor;
};

export default Plugin;
