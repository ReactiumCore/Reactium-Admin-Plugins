import Reactium, { __ } from 'reactium-core/sdk';

export default {
    MODES: {
        LOADING: 'LOADING',
        LOADED: 'LOADED',
    },
    CAPS: {
        PUBLISH: collection => ({
            capabilities: [
                `${collection}.publish`.toLowerCase(),
                'publish-content',
            ],
            strict: false,
        }),
        UNPUBLISH: collection => ({
            capabilities: [
                `${collection}.unpublish`.toLowerCase(),
                'unpublish-content',
            ],
            strict: false,
        }),
        STATUS: collection => ({
            capabilities: [
                `${collection}.setstatus-${status}`.toLowerCase(),
                'set-content-status',
            ],
            strict: false,
        }),
    },
    BUTTON_MODES: {
        PUBLISH: {
            text: __('Publish'),
            tooltip: __('Publish current version of content'),
            action: 'publish',
        },
        UNPUBLISH: {
            text: __('Unpublish'),
            tooltip: __('Unpublish current version of content'),
            action: 'unpublish',
        },
        SET_STATUS: {
            text: __('Change'),
            tooltip: __('Change status on current version of content.'),
        },
        SCHEDULE: {
            text: __('Schedule'),
            tooltip: __('Schedule sunrise and sunset of this content'),
        },
        DISABLED: {
            text: __('Disabled'),
            tooltip: __(
                'You do not have permission to do anything to this content.',
            ),
        },
    },
    SCHEDULING: {
        sunrise: {
            tooltip: __('Publish on date'),
            label: __('Sunrise'),
        },
        sunset: {
            tooltip: __('Unpublish on date'),
            label: __('Sunset'),
        },
        unschedule: {
            tooltip: __('Remove this action from schedule.'),
            label: __('Unschedule'),
        },
    },
};
