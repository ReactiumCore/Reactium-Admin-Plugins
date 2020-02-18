import React from 'react';
import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Button } from '@atomic-reactor/reactium-ui';

const Plugin = new RTEPlugin({ type: 'bold', order: 100 });

Plugin.callback = editor => {
    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: props => <strong {...props} />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 110,
        toolbar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                active={Reactium.RTE.isMarkActive(editor, Plugin.type)}
                onClick={e => Reactium.RTE.toggleMark(editor, Plugin.type, e)}
                {...props}>
                <span className='ico'>B</span>
            </Button>
        ),
    });

    // register hotkeys
    Reactium.RTE.Hotkey.register(Plugin.type, {
        keys: ['mod+b'],
        callback: ({ editor, event }) => {
            event.preventDefault();
            Reactium.RTE.toggleMark(editor, Plugin.type);
        },
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = element =>
        element.type === Plugin.type ? true : isInline(element);

    return editor;
};

export default Plugin;
