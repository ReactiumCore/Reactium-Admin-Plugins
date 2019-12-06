import op from 'object-path';
import ENUMS from './enums';
import domain from './domain';
import MediaLibrary from './index';
import MediaSdk from './_utils/sdk';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './Widget/SidebarWidget';
import DirectoryWidget from './Widget/DirectoryWidget';

Reactium.Plugin.register(domain.name).then(() => {
    // Create Reactium.Media SDK
    Reactium[domain.name] = op.get(Reactium, domain.name, MediaSdk);

    // Register components
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

    // Register hooks
    Reactium.Hook.register('app-ready', () => {
        Reactium.Pulse.register('MediaClear', () => Reactium.Media.clear());
    });

    Reactium.Hook.register('plugin-unregister', ({ ID }) => {
        // Tear down Reactium.Media SDK
        if (ID === domain.name) delete Reactium[domain.name];
    });

    Reactium.Hook.register('media-file-actions', actions => {
        actions['delete'] = {
            color: 'danger',
            icon: 'Feather.X',
            iconSize: 20,
            id: 'delete',
            tooltip: ENUMS.TEXT.DELETE,
            types: ['image', 'video', 'other'],
        };

        actions['edit'] = {
            icon: 'Feather.Edit2',
            id: 'edit',
            tooltip: ENUMS.TEXT.EDIT,
            types: ['image', 'video', 'other'],
        };
    });
});
