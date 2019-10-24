import React, { useEffect, useRef, useState } from 'react';
import Reactium from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        SUBMITTING: 'submitting',
        READY: 'ready',
        SUCCESS: 'success',
    },
};
/**
 * -----------------------------------------------------------------------------
 * Functional Component: Login
 * -----------------------------------------------------------------------------
 */
const Logout = ({ className, redirect, ...props }) => {
    const stateRef = useRef({
        status: ENUMS.STATUS.READY,
    });

    const [, setNewState] = useState(stateRef.current);

    const setState = (newState = {}) => {
        stateRef.current = { ...stateRef.current, ...newState };
        setNewState(stateRef.current);
    };

    useEffect(() => {
        const { status } = stateRef.current;
        if (status === ENUMS.STATUS.SUCCESS) {
            window.location.href = redirect;
        }

        if (status === ENUMS.STATUS.READY) {
            setState({ status: ENUMS.STATUS.SUBMITTING });

            Reactium.User.logOut().then(() =>
                setState({ status: ENUMS.STATUS.SUCCESS }),
            );
        }
    });

    const render = () => {
        if (!Reactium.User.current()) {
            window.location.href = redirect;
        }

        return null;
    };

    return render();
};

Logout.defaultProps = {
    redirect: '/login',
};

export default Logout;
