import { __ } from 'reactium-core/sdk';

const ENUMS = {
    ACTION_TYPE: 'DOMAIN_UPDATE',
    DEBUG: true,
    EVENT: {
        ADDED: 'queued',
        REMOVED: 'cancelled',
    },
    //MAX_BYTES: 500000,
    MAX_BYTES: 5000,
    MAX_UPLOADS: 1,
    STATUS: {
        COMPLETE: 'complete',
        QUEUED: 'queued',
        UPLOADING: 'uploading',
    },
    TEXT: {
        BROWSE: __('Browse Files'),
        EMPTY: __('Drop your files here'),
    },
};

export { ENUMS as default };
