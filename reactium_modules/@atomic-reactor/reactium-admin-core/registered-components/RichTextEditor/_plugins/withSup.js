import React from 'react';
import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Button } from '@atomic-reactor/reactium-ui';

const Plugin = new RTEPlugin({ type: 'sup', order: 100 });

Plugin.callback = editor => {
    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ children }) => <sup children={children} />,
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
                <sup>1</sup>
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
