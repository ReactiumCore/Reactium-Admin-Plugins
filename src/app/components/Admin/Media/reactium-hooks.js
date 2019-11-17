import MediaLibrary from './index';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

Reactium.Plugin.register('AdminMediaLibrary').then(() => {
    Reactium.Plugin.addComponent({
        id: 'ADMIN-MEDIA-LIBRARY',
        component: MediaLibrary,
        zone: ['admin-media-content'],
        order: -1000,
    });

    Reactium.Plugin.addComponent({
        id: 'ADMIN-MEDIA-LIBRARY-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: 0,
    });
});
