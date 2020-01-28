import React from 'react';
import op from 'object-path';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Editor, Transforms } from 'slate';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Panel from './Panel';

const Plugin = new RTEPlugin({ type: 'formatter', order: 100 });

Plugin.callback = editor => {
    // register toolbar buttons
    Reactium.RTE.Button.register(Plugin.type, {
        order: 0,
        toolbar: true,
        sidebar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                onClick={onButtonClick}
                {...props}>
                <Icon {...Reactium.RTE.ENUMS.PROPS.ICON} name='Feather.Type' />
            </Button>
        ),
    });

    const onButtonClick = e => {
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
            .setContent(<Panel />)
            .toggle();
    };

    return editor;
};

export default Plugin;
