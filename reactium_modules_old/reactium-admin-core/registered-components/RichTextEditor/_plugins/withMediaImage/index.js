import Element from './Element';
import RTEPlugin from '../../RTEPlugin';
import MediaInsert from '../../MediaInsert';
import Reactium, { __ } from 'reactium-core/sdk';

const Plugin = new RTEPlugin({ type: 'image', order: 50 });

Plugin.callback = editor => {
    // register format
    Reactium.RTE.Format.register(Plugin.type, { element: Element });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 51,
        sidebar: true,
        button: props => (
            <MediaInsert
                {...props}
                type='image'
                icon='Feather.Camera'
                tooltip={__('Add Image')}
                title={__('Select Image')}
            />
        ),
    });

    // Editor overrides
    const { isInline, isVoid } = editor;

    editor.isVoid = n => (n.type === Plugin.type ? true : isVoid(n));
    editor.isInline = n => (n.type === Plugin.type ? false : isInline(n));

    return editor;
};

export default Plugin;
