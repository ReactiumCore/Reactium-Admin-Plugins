import { __ } from 'reactium-core/sdk';

export default {
    CLOSE: {
        label: __('Close'),
        tooltip: __('Click to close version manager'),
    },
    SELECT_BRANCH: {
        label: __('Select Version'),
        tooltip: __('Select content version to start from'),
    },
    COMPARE_BRANCH: {
        label: __('Compare Version'),
        tooltip: __('Select content version to compare with'),
    },
    SET_BRANCH: {
        label: __('Set Version'),
        tooltip: __('Set to version %version'),
    },
    REVISIONS: {
        label: __('%version Revisions'),
        tooltip: __('Compare revisions in %version'),
    },
    CLONE: {
        label: __('Clone Version %version'),
        tooltip: __('Clone version %version'),
    },
    BACK_BUTTON: {
        label: __('Back'),
        tooltip: __('Back to version manager'),
    },
    SAVE_CHANGES: {
        label: __('Save Changes'),
        tooltip: __('Apply changes to current content'),
    },
};
