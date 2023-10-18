/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin FieldTypePublish
 * -----------------------------------------------------------------------------
 */

import { Editor } from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

(async () => {
    await Reactium.Plugin.register('FieldTypePublish');
    Reactium.Component.register('FieldTypePublish', Editor);
    Reactium.Content.Editor.register('Publish', { component: Editor });

    Reactium.Hook.registerSync(
        'content-editor-elements',
        ({ fields }) => {
            fields.add({
                region: 'sidebar',
                fieldId: 'publish',
                fieldName: 'publish',
                fieldType: 'Publish',
            });
        },
        Reactium.Enums.priority.lowest,
        'ADMIN-CONTENT-PUBLISH',
    );
})();
