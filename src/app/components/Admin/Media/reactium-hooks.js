import MediaLibrary from './index';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';
import DirectoryWidget from './DirectoryWidget';

Reactium.Plugin.register('AdminMediaLibrary').then(() => {
    Reactium.Plugin.addComponent({
        id: 'ADMIN-MEDIA-LIBRARY',
        component: MediaLibrary,
        order: -1000,
        zone: ['admin-media-content'],
    });

    Reactium.Plugin.addComponent({
        id: 'ADMIN-MEDIA-LIBRARY-SIDEBAR-WIDGET',
        component: SidebarWidget,
        order: 0,
        zone: ['admin-sidebar-menu'],
    });

    Reactium.Plugin.addComponent({
        id: 'ADMIN-MEDIA-LIBRARY-DIRECTORY-WIDGET',
        component: DirectoryWidget,
        order: 0,
        zone: ['admin-media-empty', 'admin-media-toolbar'],
    });
});

Reactium.Hook.register('app-ready', () => {
    Reactium.Pulse.register('MediaClear', () => Reactium.Media.clear());
});
