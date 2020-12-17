import Element from './Element';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import ToolbarButton from './ToolbarButton';

const Plugin = new RTEPlugin({ type: 'video', order: 52 });

Plugin.callback = editor => {
    // register format
    Reactium.RTE.Format.register(Plugin.type, {
        element: Element,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 52,
        sidebar: true,
        button: ToolbarButton,
    });

    // Editor overrides
    const { isInline, isVoid } = editor;

    editor.isInline = n => (n.type === Plugin.type ? false : isInline(n));

    editor.isVoid = n => (n.type === Plugin.type ? true : isVoid(n));

    return editor;
};

export default Plugin;
