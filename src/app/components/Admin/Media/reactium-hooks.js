import op from 'object-path';
import domain from './domain';
import Editor from './Editor';
import Actinium from 'appdir/api';
import MediaLibrary from './index';
import MediaSdk from './_utils/sdk';
import Breadcrumbs from './Breadcrumbs';
import SidebarWidget from './SidebarWidget';
import DirectoryWidget from './Directory/Widget';
import HeaderWidget from './Editor/HeaderWidget';
import Reactium, { __ } from 'reactium-core/sdk';
import { MediaCopy, MediaDelete, MediaDownload } from './List/_plugins';
import {
    Audio,
    File,
    Image,
    ImageCrop,
    Meta,
    ThumbnailSelect,
    Video,
} from './Editor/_plugins';

Reactium.Plugin.register(domain.name, 100000).then(() => {
    // Alias the Actinium.File SDK
    Reactium['File'] = op.get(Reactium, 'File', Actinium.File);

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
    Reactium.Component.register('MediaEditor', Editor);
    Reactium.Component.register('MediaEditorAudio', Audio);
    Reactium.Component.register('MediaEditorFile', File);
    Reactium.Component.register('MediaEditorImage', Image);
    Reactium.Component.register('MediaEditorMeta', Meta);
    Reactium.Component.register('MediaEditorThumbnail', ImageCrop);
    Reactium.Component.register('MediaEditorThumbnailSelect', ThumbnailSelect);
    Reactium.Component.register('MediaEditorVideo', Video);

    Reactium.Capability.Settings.register('media-ui.view', {
        capability: 'media-ui.view',
        title: __('UI: Media'),
        tooltip: __('Able to view the media library when logged in.'),
    });

    Reactium.Capability.Settings.register('Media.retrieve', {
        capability: 'Media.retrieve',
        title: __('Media: Retrieve'),
        tooltip: __('Able to retrieve media when logged in.'),
    });

    Reactium.Capability.Settings.register('Media.create', {
        capability: 'Media.create',
        title: __('Media: Create'),
        tooltip: __('Able to create media when logged in.'),
    });

    Reactium.Capability.Settings.register('Media.update', {
        capability: 'Media.update',
        title: __('Media: Update'),
        tooltip: __('Able to update media when logged in.'),
    });

    Reactium.Capability.Settings.register('Media.delete', {
        capability: 'Media.delete',
        title: __('Media: Delete'),
        tooltip: __('Able to delete media when logged in.'),
    });

    // Add components to zones
    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR-HEADER-WIDGET',
        component: HeaderWidget,
        order: 1,
        zone: ['admin-logo'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR',
        component: 'MediaEditor',
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
        id: 'ADMIN-MEDIA-THUMBNAIL-GENERATE',
        component: ImageCrop,
        order: 2000,
        label: __('Thumbnail'),
        field: 'thumbnail',
        tooltip: {
            copy: __('copy url to clipboard'),
            generate: __('create a new thumbnail'),
        },
        zone: ['admin-media-editor-meta-image'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-DELETE',
        component: MediaDelete,
        order: 10000,
        block: true,
        className: 'admin-media-editor-delete',
        zone: ['admin-media-editor-sidebar-footer'],
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

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR-IMAGE',
        component: 'MediaEditorImage',
        order: 100,
        zone: ['admin-media-editor-image'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR-VIDEO',
        component: 'MediaEditorVideo',
        order: 100,
        zone: ['admin-media-editor-video'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR-AUDIO',
        component: 'MediaEditorAudio',
        order: 100,
        zone: ['admin-media-editor-audio'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-MEDIA-EDITOR-FILE',
        component: 'MediaEditorFile',
        order: 100,
        zone: ['admin-media-editor-file'],
    });
});
