import Element from './Element';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import ToolbarButton from './ToolbarButton';

const Plugin = new RTEPlugin({ type: 'image', order: 50 });

Plugin.callback = editor => {
    // register format
    Reactium.RTE.Format.register(Plugin.type, { element: Element });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 51,
        sidebar: true,
        button: ToolbarButton,
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = n => (n.type === Plugin.type ? false : isInline(n));

    return editor;
};

export default Plugin;
