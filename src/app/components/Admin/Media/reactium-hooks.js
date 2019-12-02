import MediaLibrary from './index';
import clear from './utils/clearTask';
import queue from './utils/queueTask';
import upload from './utils/uploadTask';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

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
});

Reactium.Hook.register('app-ready', () => {
    // Reactium.Pulse.register('MediaClear', clear);
    // Reactium.Pulse.register('MediaQueue', queue);
    // Reactium.Pulse.register('MediaUpload', upload);
});
