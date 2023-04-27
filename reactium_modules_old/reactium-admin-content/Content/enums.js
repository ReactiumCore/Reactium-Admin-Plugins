import { __ } from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        PENDING: 'pending',
        FETCHING: 'fetching',
        COMPLETE: 'complete',
        BUSY: 'busy',
    },
    TEXT: {
        EDITOR: __('Editor'),
        LIST: __('Content'),
        NEW: __('New'),
        SAVE: __('Save %type'),
        SAVING: __('Saving %type...'),
        SAVED: __('Saved %type!'),
        SAVE_ERROR: __('Unable to save %type'),
    },
};

export default ENUMS;
