import { __ } from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        COMPLETE: __('COMPLETE'),
        ERROR: __('ERROR'),
        INIT: __('INIT'),
        READY: __('READY'),
        SAVING: __('SAVING'),
    },
    TEXT: {
        AVATAR: {
            REMOVE: __('Remove'),
            UPLOAD: __('Upload'),
        },
        ERROR: __('Unable to save profile'),
        INPUT: {
            ACCOUNT_INFO: __('Account Info'),
            EMAIL: __('Email Address'),
            FNAME: __('First Name'),
            LNAME: __('Last Name'),
            NAME: __('Name'),
        },
        PASSWORD: {
            BUTTON: __('Reset'),
            CONFIRM: __('Are you sure?'),
            INFO: __('Resetting your password will sign you out.'),
            LABEL: __('Password'),
            NO: __('NO'),
            TITLE: __('Reset Password'),
            YES: __('YES'),
        },
        SAVING: __('Saving...'),
        SAVE: __('Save Profile'),
        SUCCESS: __('Profile Updated'),
    },
};

export default ENUMS;
