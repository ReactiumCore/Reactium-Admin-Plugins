const Enums = {
    transitionStates: [
        {
            state: 'EXITING',
            active: 'previous',
        },
        {
            state: 'LOADING',
            active: 'current',
        },
        {
            state: 'ENTERING',
            active: 'current',
        },
        {
            state: 'READY',
            active: 'current',
        },
    ],
};

export default Enums;
