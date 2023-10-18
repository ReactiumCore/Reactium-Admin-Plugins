import { Media } from './Media';
import Reactium from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Media
 * -----------------------------------------------------------------------------
 */
(async () => {
    await Reactium.Plugin.register('CTE-MEDIA');

    Reactium.Content.Editor.register('Media', { component: Media });

    Reactium.Hook.registerSync(
        'content-editor-elements-media',
        ({ fields }) => {
            fields.remove('title').remove('status').add({
                index: 0,
                region: 'sidebar',
                fieldId: 'media',
                fieldName: 'file',
                fieldType: 'Media',
            });
        },
        Reactium.Enums.priority.lowest,
        'ADMIN-CONTENT-MEDIA-ELEMENTS',
    );
})();
