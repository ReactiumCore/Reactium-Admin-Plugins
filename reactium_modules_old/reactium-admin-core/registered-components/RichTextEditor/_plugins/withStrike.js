import React from 'react';
import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Button, Icon } from 'reactium-ui';

const Plugin = new RTEPlugin({ type: 'strike', order: 100 });

Plugin.callback = editor => {
    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: props => <strike {...props} />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 140,
        formatter: true,
        toolbar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                active={Reactium.RTE.isMarkActive(editor, Plugin.type)}
                onClick={e => Reactium.RTE.toggleMark(editor, Plugin.type, e)}
                {...props}>
                <span className='ico'>S</span>
                <Icon
                    {...Reactium.RTE.ENUMS.PROPS.ICON}
                    name='Feather.Minus'
                    size={32}
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translateX(-50%) translateY(-50%)',
                    }}
                />
            </Button>
        ),
    });

    // register hotkeys
    Reactium.RTE.Hotkey.register(Plugin.type, {
        keys: ['mod+-'],
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
