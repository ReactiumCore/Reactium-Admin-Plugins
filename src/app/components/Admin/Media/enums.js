import Reactium, { __ } from 'reactium-core/sdk';

const ENUMS = {
    ...Reactium.Media.ENUMS,
    TEXT: {
        BROWSE: __('Browse Files'),
        EMPTY: __('Drop your files here'),
        NEW_FOLDER: __('New folder'),
        TITLE: __('Media Library'),
    },
};

export { ENUMS as default };
