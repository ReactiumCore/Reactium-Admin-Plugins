export default {
    PROPS: {
        BUTTON: {
            size: 'xs',
            type: 'button',
            color: 'tertiary',
            style: { padding: 0 },
        },
        ICON: {
            size: 18,
        },
    },
    LIST_TYPES: ['ol', 'ul', 'number-list', 'bullet-list'],
    STATUS: {
        INIT: 'INIT',
        PENDING: 'PENDING',
        READY: 'READY',
    },
};
