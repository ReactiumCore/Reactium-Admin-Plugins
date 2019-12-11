import Reactium, { __ } from 'reactium-core/sdk';
import MediaENUMS from './_utils/sdk/enums';

const ENUMS = {
    ...MediaENUMS,
    CAPABILITY: [
        { value: 'Media.create', label: 'Can Upload' },
        { value: 'Media.all', label: 'Public View' },
    ],
    TEXT: {
        BROWSE: __('Browse Files'),
        CONFIRM_DELETE: __('Confirm Delete'),
        COPY_TO_CLIPBOARD: __('Copy to clipboard'),
        COPIED_TO_CLIPBOARD: __('Copied to clipboard'),
        DELETE_INFO: [__('Delete'), __('Are you sure?')],
        DELETE: __('Delete file'),
        DOWNLOAD_FILE: __('Download file'),
        EDIT: __('Edit file'),
        EMPTY: __('Drop your files here'),
        FILTER: __('Filter'),
        FOLDER: __('Select folder'),
        FOLDER_ALL: __('All folders'),
        FOLDER_EDIT: __('Edit folders'),
        FOLDER_EDITOR: {
            CAN_EDIT: __('Can Edit'),
            CAN_VIEW: __('Can View'),
            DIRECTORY: __('Folder name'),
            TITLE: __('Folder Editor'),
            USER: __('Users or roles'),
            SAVE: __('Save Folder'),
        },
        NEW_FOLDER: __('New folder'),
        TITLE: __('Media Library'),
        TOOLBAR: __('Drop your files here'),
        VIEW_FILE: __('View file'),
        VIDEO_UNSUPPORTED: __('Your browser does not support this video'),
    },
};

export { ENUMS as default };
