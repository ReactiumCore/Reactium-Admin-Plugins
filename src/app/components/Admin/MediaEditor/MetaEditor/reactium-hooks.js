import Reactium from 'reactium-core/sdk';
import MetaEditor from './index';

Reactium.Zone.addComponent({
    id: 'ADMIN-MEDIA-EDITOR-META',
    component: MetaEditor,
    order: 1000,
    zone: ['admin-media-editor-meta'],
});
