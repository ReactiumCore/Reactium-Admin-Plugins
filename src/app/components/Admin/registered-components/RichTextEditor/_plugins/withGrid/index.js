import React from 'react';
import Panel from './Panel';
import RTEPlugin from '../../RTEPlugin';
import Reactium, { __ } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const Plugin = new RTEPlugin({ type: 'grid', order: 100 });

Plugin.callback = editor => {
    const onButtonClick = () => {
        const x = window.innerWidth / 2 - 150;
        const y = 50;

        editor.panel
            .setID(Plugin.type)
            .setContent(<Panel selection={editor.selection} />)
            .moveTo(x, y)
            .show();
    };

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 60,
        sidebar: true,
        button: props => {
            return (
                <Button
                    {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                    onClick={onButtonClick}
                    data-tooltip={__('Grid Layout')}
                    {...props}>
                    <Icon
                        {...Reactium.RTE.ENUMS.PROPS.ICON}
                        name='Feather.Layout'
                        size={22}
                    />
                </Button>
            );
        },
    });

    return editor;
};

export default Plugin;
