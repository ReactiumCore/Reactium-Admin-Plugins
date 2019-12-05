import Reactium, { __ } from 'reactium-core/sdk';

const ENUMS = {
    ...Reactium.Media.ENUMS,
    TEXT: {
        BROWSE: __('Browse Files'),
        EMPTY: __('Drop your files here'),
        FILTER: __('Filter'),
        FOLDER: __('Select folder'),
        NEW_FOLDER: __('New folder'),
        TITLE: __('Media Library'),
        TOOLBAR: __('Drop your files here'),
    },
};

export { ENUMS as default };
