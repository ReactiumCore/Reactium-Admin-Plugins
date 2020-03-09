import op from 'object-path';
import ENUMS from './enums';
import domain from './domain';
import Parse from 'appdir/api';
import MediaLibrary from './index';
import MediaSdk from './_utils/sdk';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './Widget/SidebarWidget';
import DirectoryWidget from './Widget/DirectoryWidget';

Reactium.Plugin.register(domain.name).then(() => {
    // Alias the Parse.File SDK
    Reactium['File'] = op.get(Reactium, 'File', Parse.File);

    // Create Reactium.Media SDK
    Reactium[domain.name] = op.get(Reactium, domain.name, new MediaSdk());

    // Register components
    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-LIBRARY',
        component: MediaLibrary,
        order: -1000,
        zone: ['admin-media-content'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-LIBRARY-SIDEBAR-WIDGET',
        component: SidebarWidget,
        order: 400,
        zone: ['admin-sidebar-menu'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-LIBRARY-DIRECTORY-WIDGET',
        component: DirectoryWidget,
        order: 0,
        zone: ['admin-media-empty', 'admin-media-toolbar'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-CRUMBS',
        component: Breadcrumbs,
        order: 1,
        zone: ['admin-header'],
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
            order: 0,
            tooltip: ENUMS.TEXT.DELETE,
            types: ['audio', 'image', 'other', 'video'],
        };

        actions['download'] = {
            icon: 'Linear.CloudDownload',
            iconSize: 20,
            id: 'download',
            order: 1,
            tooltip: ENUMS.TEXT.DOWNLOAD_FILE,
            types: ['audio', 'image', 'other', 'video'],
        };

        actions['edit-audio'] = {
            icon: 'Feather.Edit2',
            id: 'edit-audio',
            order: 2,
            tooltip: ENUMS.TEXT.EDIT_FILE,
            types: ['audio'],
        };

        actions['edit-image'] = {
            icon: 'Feather.Edit2',
            id: 'edit-image',
            order: 2,
            tooltip: ENUMS.TEXT.EDIT_FILE,
            types: ['image'],
        };

        actions['edit-other'] = {
            icon: 'Feather.Edit2',
            id: 'edit-other',
            order: 2,
            tooltip: ENUMS.TEXT.EDIT_FILE,
            types: ['other'],
        };

        actions['edit-video'] = {
            icon: 'Feather.Edit2',
            id: 'edit-video',
            order: 2,
            tooltip: ENUMS.TEXT.EDIT_FILE,
            types: ['video'],
        };
    });
});
