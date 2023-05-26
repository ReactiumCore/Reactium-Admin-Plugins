/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin FieldTypePublish
 * -----------------------------------------------------------------------------
 */

import _ from 'underscore';
import { Editor } from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

(async () => {
    await Reactium.Plugin.register('FieldTypePublish');
    Reactium.Component.register('FieldTypePublish', Editor);
    Reactium.Content.Editor.register('Publish', { component: Editor });

    Reactium.Hook.registerSync(
        'content-editor-elements',
        (fields) => {
            const isField = !!_.findWhere(fields, { fieldId: 'publish' });
            if (isField) return;

            fields.push({
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
