import Element from './Element';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import ToolbarButton from './ToolbarButton';

const Plugin = new RTEPlugin({ type: 'tabs', order: 50 });

Plugin.callback = editor => {
    // register block
    Reactium.RTE.Block.register(Plugin.type, { element: Element });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        button: ToolbarButton,
        order: 100,
        sidebar: true,
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = n => (n.type === Plugin.type ? false : isInline(n));

    return editor;
};

export default Plugin;
