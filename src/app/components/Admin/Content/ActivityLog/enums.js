import { __ } from 'reactium-core/sdk';

export default {
    HEADER: __('Updates'),
    CHANGES: {
        DEFAULT: {
            description: __('Change %changetype% made by %who%'),
        },
        CREATED: {
            description: __('Created by %who%'),
        },
        REVISED: {
            description: __('Revised by %who%. Version %version%'),
        },
        SLUG_CHANGED: {
            description: __('Slug changed to %slug% by %who%'),
        },
        SET_REVISION: {
            description: __('Set to version %version% by %who%'),
        },
        SET_ACL: {
            description: __('%who% set permissions'),
        },
        SET_STATUS: {
            description: __('%who% set status to %status%'),
        },
        PUBLISHED: {
            description: __('Published by %who%'),
        },
        UNPUBLISHED: {
            description: __('Published by %who%'),
        },
        SCHEDULE: {
            description: __('Scheduled by %who%'),
        },
        UNSCHEDULE: {
            description: __('Unschedule by %who%'),
        },
        SCHEDULED_PUBLISH: {
            description: __('Scheduled publish by %who%'),
        },
        SCHEDULED_UNPUBLISH: {
            description: __('Scheduled unpublish by %who%'),
        },
        TRASHED: {
            description: __('Trashed by %who%'),
        },
        DELETED: {
            description: __('Deleted by %who%'),
        },
        RESTORED: {
            description: __('Restored by %who%'),
        },
    },
};
