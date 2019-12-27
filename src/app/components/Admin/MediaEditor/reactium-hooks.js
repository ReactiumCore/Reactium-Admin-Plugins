import op from 'object-path';
import domain from './domain';
import MediaEditor from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register(domain.name).then(() => {
    // Register components
    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR',
        component: MediaEditor,
        order: -1000,
        zone: ['admin-media-editor'],
    });
});
