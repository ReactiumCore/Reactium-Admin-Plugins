import Element from './Element';
import ToolbarButton from './ToolbarButton';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';

const Plugin = new RTEPlugin({ type: 'tabs', order: 50 });

Plugin.callback = editor => {
    // register block
    Reactium.RTE.Block.register(Plugin.type, { element: Element });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: -1000,
        sidebar: true,
        button: ToolbarButton,
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = n => (n.type === Plugin.type ? false : isInline(n));

    return editor;
};

export default Plugin;
