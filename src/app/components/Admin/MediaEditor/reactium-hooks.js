import op from 'object-path';
import domain from './domain';
import MediaEditor from './index';
import Reactium from 'reactium-core/sdk';

import { Directory, Tags } from './_utils/components';

Reactium.Plugin.register(domain.name).then(() => {
    // Register components
    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR',
        component: MediaEditor,
        order: -1000,
        zone: ['admin-media-editor'],
    });
});

Reactium.Component.register('MediaEditorDirectory', Directory);
Reactium.Component.register('MediaEditorTags', Tags);
