import React from 'react';
import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Button } from 'reactium-ui';

const Plugin = new RTEPlugin({ type: 'sub', order: 100 });

Plugin.callback = editor => {
    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ children }) => <sub children={children} />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 160,
        toolbar: true,
        button: ({ editor, ...props }) => (
            <Button
                {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                active={Reactium.RTE.isMarkActive(editor, Plugin.type)}
                onClick={e => Reactium.RTE.toggleMark(editor, Plugin.type, e)}
                {...props}>
                <span className='ico'>T</span>
                <sub>1</sub>
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
