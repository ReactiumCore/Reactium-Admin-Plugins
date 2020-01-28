import op from 'object-path';
import domain from './domain';
import RTE from './_utils/sdk';
import RichTextEditor from './index';
import defaultPlugins from './_plugins';
import Reactium from 'reactium-core/sdk';

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
    },
);
