import { __ } from 'reactium-core/sdk';
import MediaENUMS from './_utils/sdk/enums';

const ENUMS = {
    ...MediaENUMS,
    CAPABILITY: [
        { value: 'Media.create', label: 'Can Upload' },
        { value: 'Media.all', label: 'Public View' },
    ],
    TEXT: {
        AUDIO_UNSUPPORTED: __('Your browser does not support this audio'),
        BACK: __('Back'),
        BROWSE: __('Browse Files'),
        CONFIRM: __('Are you sure?'),
        CONFIRM_DELETE: __('Confirm Delete'),
        COPIED_TO_CLIPBOARD: __('Copied to clipboard'),
        COPY_TO_CLIPBOARD: __('Copy to clipboard'),
        DELETE: __('Delete file'),
        DELETE_INFO: [__('Delete'), __('Are you sure?')],
        DOWNLOAD_FILE: __('Download file'),
        EDIT: __('Edit'),
        EDIT_FILE: __('Edit file'),
        EDITOR: {
            SUCCESS: 'Save complete!',
        },
        EMPTY: __('Drop your files here'),
        FILTER: __('Filter by type'),
        FOLDER: __('Select folder'),
        FOLDER_ALL: __('All folders'),
        FOLDER_CREATOR: {
            CAN_EDIT: __('Can Edit'),
            CAN_VIEW: __('Can View'),
            DIRECTORY: __('Folder name'),
            TITLE: __('New Folder'),
            USER: __('Users or roles'),
            SAVE: __('Save Folder'),
        },
        FOLDER_EDIT: __('Edit folders'),
        FOLDER_EDITOR: {
            CANCEL: __('cancel'),
            DELETE: __('delete'),
            DELETE_ALL: __('delete selected'),
            DELETE_ASK: [__('Are you sure you want to delete'), __('folder?')],
            EDIT: __('edit'),
            TITLE: [__('Folder'), __('Folders')],
        },
        MEDIA: __('Media'),
        NEW_FOLDER: __('New folder'),
        SEARCH: __('Search'),
        SELECT_ERROR: {
            MAX: __('Maximum number of items has been selected'),
            MIN: __('Minium number of items has not been selected'),
        },
        TITLE: __('Media Library'),
        TOOLBAR: __('Drop your files here'),
        VIEW_FILE: __('View file'),
        VIDEO_UNSUPPORTED: __('Your browser does not support this video'),
    },
};

ENUMS.STATUS.FETCHING = 'fetching';
ENUMS.STATUS.INIT = 'init';

export { ENUMS as default };
