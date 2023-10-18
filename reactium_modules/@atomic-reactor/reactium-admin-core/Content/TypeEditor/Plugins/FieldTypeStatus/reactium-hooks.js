/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin FieldTypeStatus
 * -----------------------------------------------------------------------------
 */

import { Editor } from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

(async () => {
    await Reactium.Plugin.register('FieldTypeStatus');
    Reactium.Component.register('FieldTypeStatus', Editor);
    Reactium.Content.Editor.register('Status', { component: Editor });

    Reactium.Hook.registerSync(
        'content-editor-elements',
        ({ fields }) => {
            fields.add({
                index: 0,
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
