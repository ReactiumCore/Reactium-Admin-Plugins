import { __ } from 'reactium-core/sdk';

const ENUMS = {
    DEBUG: false,
    STATUS: {
        ERROR: 'ERROR',
        SUBMITTING: 'SUBMITTING',
        READY: 'READY',
        SUCCESS: 'SUCCESS',
        COMPLETE: 'COMPLETE',
    },
    TEXT: {
        BUTTON: {
            SUBMIT: __('Submit'),
            SUBMITTING: __('Updating...'),
        },
        LABEL: {
            CONFIRM: __('Confirm'),
            CREATE: __('Create Account'),
            PASSWORD: __('New Password'),
            SIGNIN: __('Sign In'),
        },
        MESSAGE: __('Enter your new password'),
        SUCCESS: __('Password Reset!'),
        TITLE: __('Reset Password'),
    },
};

export default ENUMS;
