import React, { forwardRef } from 'react';

export default {
    APPEARANCE: {
        CIRCLE: 'circle',
        PILL: 'pill',
    },
    COLOR: {
        CLEAR: 'clear',
        DANGER: 'danger',
        DEFAULT: 'default',
        ERROR: 'error',
        INFO: 'info',
        PRIMARY: 'primary',
        SECONDARY: 'secondary',
        SUCCESS: 'success',
        TERTIARY: 'tertiary',
        WARNING: 'warning',
    },
    ELEMENT: {
        BUTTON: forwardRef((props, ref) => (
            <button {...props} type='button' ref={ref} />
        )),
        LABEL: forwardRef((props, ref) => <label {...props} ref={ref} />),
        LINK: forwardRef((props, ref) => <a {...props} ref={ref} />),
        SUBMIT: forwardRef((props, ref) => (
            <button {...props} type='submit' ref={ref} />
        )),
    },
    SIZE: {
        XS: 'xs',
        SM: 'sm',
        MD: 'md',
        LG: 'lg',
    },
    TYPE: {
        BUTTON: 'BUTTON',
        LABEL: 'LABEL',
        LINK: 'LINK',
        SUBMIT: 'SUBMIT',
    },
};
