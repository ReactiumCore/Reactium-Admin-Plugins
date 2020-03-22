import op from 'object-path';
import ENUMS from './enums';
import domain from './domain';
import Editor from './Editor';
import Parse from 'appdir/api';
import MediaLibrary from './index';
import MediaSdk from './_utils/sdk';
import Breadcrumbs from './Breadcrumbs';
import Reactium, { __ } from 'reactium-core/sdk';
import SidebarWidget from './Widget/SidebarWidget';
import DirectoryWidget from './Widget/DirectoryWidget';
import { MediaCopy, MediaDelete, MediaDownload } from './List/_plugins';
import { Meta, ThumbnailSelect } from './Editor/_plugins';
// import { Directory, Tags } from './_utils/components';

Reactium.Plugin.register(domain.name).then(() => {
    // Alias the Parse.File SDK
    Reactium['File'] = op.get(Reactium, 'File', Parse.File);

    // Create Reactium.Media SDK
    Reactium[domain.name] = op.get(Reactium, domain.name, new MediaSdk());

    // Register hooks
    Reactium.Hook.register('app-ready', () => {
        Reactium.Pulse.register('MediaClear', () => Reactium.Media.clear());
    });

    Reactium.Hook.register('plugin-unregister', ({ ID }) => {
        // Tear down Reactium.Media SDK
        if (ID === domain.name) delete Reactium[domain.name];
    });

    // Register components
    Reactium.Component.register('AdminMediaEditor', Editor);
    Reactium.Component.register('MediaMeta', Meta);
    Reactium.Component.register('ThumbnailSelect', ThumbnailSelect);

    // Register components
    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR',
        component: 'AdminMediaEditor',
        order: -1000,
        zone: ['admin-media-editor'],
    });

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

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-META-INPUTS',
        component: Meta,
        order: 1000,
        zone: ['admin-media-editor-meta'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-THUMBNAIL-SELECT',
        component: ThumbnailSelect,
        label: __('Thumbnail'),
        property: 'thumbnail',
        order: 2000,
        zone: [
            'admin-media-editor-meta-audio',
            'admin-media-editor-meta-file',
            'admin-media-editor-meta-video',
        ],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-ACTIONS-COPY',
        component: MediaCopy,
        order: 200,
        zone: ['media-actions'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-ACTIONS-DELETE',
        component: MediaDelete,
        order: -100,
        zone: ['media-actions'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-ACTIONS-DOWNLOAD',
        component: MediaDownload,
        order: 100,
        zone: ['media-actions'],
    });
});
