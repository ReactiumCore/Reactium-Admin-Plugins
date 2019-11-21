import MediaLibrary from './index';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';
import addToQueue from './utils/addToQueue';

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

Reactium.Hook.register('app-ready', () =>
    Reactium.Pulse.register('MediaQueueAdd', addToQueue),
);
