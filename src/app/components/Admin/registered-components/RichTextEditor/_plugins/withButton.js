import React from 'react';
import RTEPlugin from '../RTEPlugin';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

const Plugin = new RTEPlugin({ type: 'button', order: 100 });

Plugin.callback = editor => {
    const element = ({ text, ...props }) => {
        const { Button } = useHookComponent('ReactiumUI');
        return <Button {...props} children={text} />;
    };

    // register leaf formats
    const leafs = ['button', 'submit'];
    leafs.forEach(leaf => Reactium.RTE.Format.register(leaf, { element }));

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = element =>
        element.type === Plugin.type ? true : isInline(element);

    return editor;
};

export default Plugin;
