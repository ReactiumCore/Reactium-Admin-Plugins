import React from 'react';
import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const Plugin = new RTEPlugin({ type: 'link', order: 100 });

Plugin.callback = editor => {
    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: props => <span {...props} className='red' />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 150,
        toolbar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                onClick={e => Reactium.RTE.toggleMark(editor, Plugin.type, e)}
                active={Reactium.RTE.isMarkActive(editor, Plugin.type)}
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
