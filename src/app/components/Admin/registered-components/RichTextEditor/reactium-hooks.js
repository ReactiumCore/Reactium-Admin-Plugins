import op from 'object-path';
import domain from './domain';
import RTE from './_utils/sdk';
import RichTextEditor from './index';
import Reactium from 'reactium-core/sdk';
import defaultBlocks from './_utils/defaultBlocks';
import defaultFormats from './_utils/defaultFormats';
import defaultPlugins from './_utils/defaultPlugins';

Reactium.Plugin.register(domain.name, Reactium.Enums.priority.highest).then(
    () => {
        // Create the SDK entry on the Reactium singleton
        Reactium.RTE = op.get(Reactium, 'RTE', RTE);

        // Register the UI Component
        Reactium.Component.register('RichTextEditor', RichTextEditor);

        // Register default plugins
        Object.entries(defaultPlugins).forEach(([id, item]) =>
            Reactium.RTE.Plugin.register(id, item),
        );

        // Register default blocks
        Object.entries(defaultBlocks).forEach(([id, item]) =>
            Reactium.RTE.Block.register(id, item),
        );

        // Register default formats
        Object.entries(defaultFormats).forEach(([id, item]) =>
            Reactium.RTE.Format.register(id, item),
        );
    },
);
