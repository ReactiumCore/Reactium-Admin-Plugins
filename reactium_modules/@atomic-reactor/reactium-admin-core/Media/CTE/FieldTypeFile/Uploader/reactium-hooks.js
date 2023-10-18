import Reactium from '@atomic-reactor/reactium-core/sdk';
import { UploaderPreviewInfo } from './UploaderPreviewInfo';
import { UploaderPreviewAction } from './UploaderPreviewAction';
import { UploaderPreviewThumbnail } from './UploaderPreviewThumbnail';

(async () => {
    await Reactium.Plugin.register('UploadPreviewComponents');

    Reactium.Zone.addComponent({
        order: -1,
        ID: 'content-media-thumbnail',
        component: UploaderPreviewThumbnail,
        zone: [
            'media-editor-upload-item-thumbnail',
            'media-editor-file-item-thumbnail',
        ],
    });

    Reactium.Zone.addComponent({
        order: -1,
        ID: 'content-media-info',
        component: UploaderPreviewInfo,
        zone: ['media-editor-upload-item-info', 'media-editor-file-item-info'],
    });

    Reactium.Zone.addComponent({
        order: -1,
        ID: 'content-media-action',
        component: UploaderPreviewAction,
        zone: [
            'media-editor-upload-item-action',
            'media-editor-file-item-action',
        ],
    });
})();
