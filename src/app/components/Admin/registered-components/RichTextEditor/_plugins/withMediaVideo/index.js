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
    const { isVoid } = editor;
    editor.isVoid = element =>
        element.type === Plugin.type ? true : isVoid(element);

    return editor;
};

export default Plugin;
