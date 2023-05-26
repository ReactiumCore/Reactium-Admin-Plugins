/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin FieldTypeTitle
 * -----------------------------------------------------------------------------
 */

import _ from 'underscore';
import { Editor } from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

(async () => {
    await Reactium.Plugin.register('FieldTypeTitle');
    Reactium.Component.register('FieldTypeTitle', Editor);
    Reactium.Content.Editor.register('Title', { component: Editor });

    Reactium.Hook.registerSync(
        'content-editor-elements',
        (fields) => {
            const isField = !!_.findWhere(fields, { fieldId: 'title' });
            if (isField) return;

            fields.splice(0, 0, {
                region: 'default',
                fieldId: 'title',
                fieldName: 'title',
                fieldType: 'Title',
            });
        },
        Reactium.Enums.priority.highest,
        'ADMIN-CONTENT-TITLE',
    );
})();
