import { __ } from '@atomic-reactor/reactium-core/sdk';

const ENUMS = {
    STATUS: {
        ERROR: 'ERROR',
        SUBMITTING: 'SUBMITTING',
        READY: 'READY',
        SUCCESS: 'SUCCESS',
        COMPLETE: 'COMPLETE',
    },
    TEXT: {
        BUTTON: {
            SIGNIN: __('Sign In'),
            SIGNING_IN: __('Signing in'),
        },
        ERROR: {
            INVALID: __('invalid username or password'),
            USERNAME: __('Enter your username'),
        },
        LABEL: {
            USERNAME: __('Username'),
            PASSWORD: __('Password'),
            FORGOT: __('Forgot Password'),
            CREATE: __('Create Account'),
        },
        TITLE: __('Login'),
    },
};

export default ENUMS;
