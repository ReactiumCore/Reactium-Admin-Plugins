const ENUMS = {
    ACTION_TYPE: 'DOMAIN_UPDATE',
    DEBUG: false,
    DOMAIN: 'Media',
    EVENT: {
        ADDED: 'queued',
        REMOVED: 'cancelled',
    },
    MAX_BYTES: 10000,
    MAX_UPLOADS: 5,
    STATUS: {
        CANCELED: 'canceled',
        COMPLETE: 'complete',
        QUEUED: 'queued',
        UPLOADING: 'uploading',
    },
    TYPE: {
        AUDIO: ['MP3', 'OGG', 'WAV'],
        PDF: ['PDF'],
        VIDEO: [
            'WEBM',
            'MPG',
            'MP2',
            'MPEG',
            'MPE',
            'MPV',
            'OGG',
            'MP4',
            'M4P',
            'M4V',
            'AVI',
            'WMV',
            'MOV',
            'QT',
            'FLV',
            'SWF',
            'AVCHD',
        ],
    },
};

export { ENUMS as default };
