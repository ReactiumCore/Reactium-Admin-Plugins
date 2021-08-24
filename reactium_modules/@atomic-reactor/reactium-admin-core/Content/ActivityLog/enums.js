import { __ } from 'reactium-core/sdk';

export default {
    HEADER: __('Updates'),
    DASH_HEADER: __('Content Activity'),
    CHANGES: {
        DEFAULT: {
            general: __('Change %changetype% to %slug% made by %who%'),
            specific: __('Change %changetype% made by %who%'),
        },
        CREATED: {
            general: __('%type% %slug% created by %who%'),
            specific: __('Created by %who%'),
        },
        REVISED: {
            general: __('%type% %slug% revised by %who%. Version %version%'),
            specific: __('Revised by %who%. Version %version%'),
        },
        CREATED_BRANCH: {
            general: __(
                'New version %version% of %type% %slug% created by %who%',
            ),
            specific: __('New version %version% of %slug% by %who%'),
        },
        DELETED_BRANCH: {
            general: __('Version %deleted% of %type% %slug% deleted by %who%'),
            specific: __('Version %deleted% of %slug% deleted by %who%'),
        },
        LABELED_BRANCH: {
            general: __(
                'Version labeled change to %version% of %type% %slug% by %who%',
            ),
            specific: __('Version labeled %version% of %slug% by %who%'),
        },
        SLUG_CHANGED: {
            general: __(
                '%type% %originalSlug% slug changed to %slug% by %who%',
            ),
            specific: __('Slug changed to %slug% by %who%'),
        },
        SET_REVISION: {
            general: __('%type% %slug% set to version %version% by %who%'),
            specific: __('Set to version %version% by %who%'),
        },
        SET_ACL: {
            general: __('%who% set permissions on %type% %slug%'),
            specific: __('%who% set permissions'),
        },
        SET_STATUS: {
            general: __('%who% set status to %status% on %type% %slug%'),
            specific: __('%who% set status to %status%'),
        },
        PUBLISHED: {
            general: __('%type% %slug% published by %who%'),
            specific: __('Published by %who%'),
        },
        UNPUBLISHED: {
            general: __('%type% %slug% unpublished by %who%'),
            specific: __('Unpublished by %who%'),
        },
        SCHEDULE: {
            general: __('%type% %slug% scheduled by %who%'),
            specific: __('Scheduled by %who%'),
        },
        UNSCHEDULE: {
            general: __('%type% %slug% unschedule by %who%'),
            specific: __('Unschedule by %who%'),
        },
        SCHEDULED_PUBLISH: {
            general: __('Scheduled publish of %type% %slug% by %who%'),
            specific: __('Scheduled publish by %who%'),
        },
        SCHEDULED_UNPUBPLISH: {
            general: __('Scheduled unpublish of %type% %slug% by %who%'),
            specific: __('Scheduled unpublish by %who%'),
        },
        TRASHED: {
            general: __('%type% %slug% trashed by %who%'),
            specific: __('Trashed by %who%'),
        },
        DELETED: {
            general: __('%type% %slug% deleted by %who%'),
            specific: __('Deleted by %who%'),
        },
        RESTORED: {
            general: __('%type% %slug% restored by %who%'),
            specific: __('Restored by %who%'),
        },
    },
};
