import Reactium, { __ } from 'reactium-core/sdk';
import MediaENUMS from './_utils/sdk/enums';

const ENUMS = {
    ...MediaENUMS,
    TEXT: {
        BROWSE: __('Browse Files'),
        CONFIRM_DELETE: __('Confirm Delete'),
        DELETE_INFO: [__('Delete'), __('Are you sure?')],
        DELETE: __('Delete file'),
        EDIT: __('Edit file'),
        EMPTY: __('Drop your files here'),
        FILTER: __('Filter'),
        FOLDER: __('Select folder'),
        NEW_FOLDER: __('New folder'),
        TITLE: __('Media Library'),
        TOOLBAR: __('Drop your files here'),
        VIDEO_UNSUPPORTED: __('Your browser does not support this video'),
    },
};

export { ENUMS as default };
