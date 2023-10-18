/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin FieldTypeTitle
 * -----------------------------------------------------------------------------
 */

import { Editor } from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

(async () => {
    await Reactium.Plugin.register('FieldTypeTitle');
    Reactium.Component.register('FieldTypeTitle', Editor);
    Reactium.Content.Editor.register('Title', { component: Editor });

    Reactium.Hook.registerSync(
        'content-editor-elements',
        ({ fields }) => {
            fields.add({
                index: 0,
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
