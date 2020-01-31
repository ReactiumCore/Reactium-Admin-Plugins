import React from 'react';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Panel from './Panel';

const Plugin = new RTEPlugin({ type: 'link', order: 100 });

Plugin.callback = editor => {
    const onButtonClick = e => {
        const btn = e.currentTarget;

        let { x, y } = editor.toolbar.container.current.getBoundingClientRect();

        const setActive = e => {
            const { id, visible } = e.target;

            if (id !== 'link' || visible === true) {
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
            .setID('link')
            .setContent(<Panel selection={editor.selection} />)
            .moveTo(x, y)
            .show();
    };

    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: props => <a {...props} className='blue link' />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 150,
        toolbar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                onClick={onButtonClick}
                {...props}>
                <Icon {...Reactium.RTE.ENUMS.PROPS.ICON} name='Feather.Link' />
            </Button>
        ),
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = element =>
        element.type === Plugin.type ? true : isInline(element);

    return editor;
};

export default Plugin;
