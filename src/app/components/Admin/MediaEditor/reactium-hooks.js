import op from 'object-path';
import domain from './domain';
import MediaEditor from './index';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import { Directory, Tags } from './_utils/components';

Reactium.Plugin.register(domain.name).then(() => {
    // Register components
    Reactium.Component.register('MediaEditorDirectory', Directory);
    Reactium.Component.register('MediaEditorTags', Tags);

    // Register plugins
    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR',
        component: MediaEditor,
        order: -1000,
        zone: ['admin-media-editor'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR-CRUMBS',
        component: Breadcrumbs,
        order: -1000,
        zone: ['admin-header'],
    });
});
