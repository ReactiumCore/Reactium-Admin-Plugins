import Reactium, { __ } from 'reactium-core/sdk';

export default {
    MODES: {
        LOADING: 'LOADING',
        LOADED: 'LOADED',
    },
    CAPS: {
        PUBLISH: collection => [
            [`${collection}.publish`, 'publish-content'],
            false,
        ],
        UNPUBLISH: collection => [
            [`${collection}.unpublish`, 'unpublish-content'],
            false,
        ],
        STATUS: (collection, status) => [
            [`${collection}.setStatus-${status}`, 'set-content-status'],
            false,
        ],
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
        DISABLED: {
            text: __('Disabled'),
            tooltip: __(
                'You do not have permission to do anything to this content.',
            ),
        },
    },
};
