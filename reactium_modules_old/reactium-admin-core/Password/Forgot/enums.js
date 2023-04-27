import { __ } from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        ERROR: 'ERROR',
        SUBMITTING: 'SUBMITTING',
        READY: 'READY',
        SUCCESS: 'SUCCESS',
    },
    TEXT: {
        BUTTON: {
            RESEND: __('Resend Emai'),
            RESENDING: __('Sending') + '...',
            SUBMIT: __('Send Email'),
            SUBMITTING: __('Sending') + '...',
        },
        LABEL: {
            EMAIL: 'Email Address',

            CONFIRM: __('Confirm'),
            CREATE: __('Create Account'),
            PASSWORD: __('New Password'),
            SIGNIN: __('Sign In'),
        },
        MESSAGE: __(
            'Reset your password by entering the email address associated with your account',
        ),
        MESSAGE_SUCCESS: [
            __('Check your'),
            __('email and follow the directions to reset your password'),
        ],
        SUCCESS: __('Request Sent') + '!',
        TITLE: __('Forgot your password') + '?',
    },
};

export default ENUMS;
