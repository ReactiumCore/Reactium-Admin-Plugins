/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin FieldTypeStatus
 * -----------------------------------------------------------------------------
 */

import _ from 'underscore';
import { Editor } from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

(async () => {
    await Reactium.Plugin.register('FieldTypeStatus');
    Reactium.Component.register('FieldTypeStatus', Editor);
    Reactium.Content.Editor.register('Status', { component: Editor });

    Reactium.Hook.registerSync(
        'content-editor-elements',
        (fields) => {
            const isField = !!_.findWhere(fields, { fieldId: 'status' });
            if (isField) return;

            fields.splice(0, 0, {
                region: 'sidebar',
                fieldId: 'status',
                fieldName: 'status',
                fieldType: 'Status',
                defaultValue: 'DRAFT',
            });
        },
        Reactium.Enums.priority.highest,
        'ADMIN-CONTENT-STATUS',
    );
})();
