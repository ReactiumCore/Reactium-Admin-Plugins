import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

import Reactium, { useDerivedState, useEventHandle } from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useEffect,
} from 'react';

const ENUMS = {
    STATUS: {
        PENDING: 'PENDING',
        INITIALIZING: 'INITIALIZING',
        INITIALIZED: 'INITIALIZED',
        READY: 'READY',
    },
};

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: WelcomeWidget
 * -----------------------------------------------------------------------------
 */
let WelcomeWidget = (
    { children, className, namespace, onStatus, ...props },
    ref,
) => {
    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------

    const containerRef = useRef();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    const [state, update] = useDerivedState({
        status: ENUMS.STATUS.PENDING,
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------

    // cx(suffix:String);
    // className extension
    const cx = Reactium.Utils.cxFactory(className || namespace);

    // dispatch(eventType:String, event:Object, callback:Function);
    // dispatch events, run a hook, execute a callack
    const dispatch = async (eventType, event, callback) => {
        if (unMounted()) return;

        eventType = String(eventType).toUpperCase();

        const evt = new CustomEvent(eventType, { details: event });

        handle.dispatchEvent(evt);

        if (unMounted()) return;
        await Reactium.Hook.run(`WelcomeWidget-${eventType}`, evt, handle);

        if (unMounted()) return;
        if (typeof callback === 'function') await callback(evt);
    };

    // initialize();
    // run initialization process
    const initialize = async () => {
        // SET STATUS TO INITIALIZING
        setState({ status: ENUMS.STATUS.INITIALIZING });

        // DO YOUR INITIALIZATION HERE

        // SET STATUS TO INITIALIZED WHEN COMPLETE
        setState({ status: ENUMS.STATUS.INITIALIZED });
    };

    // unmount();
    // check if the component has been unmounted
    const unMounted = () => !containerRef.current;

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------

    const _handle = () => ({
        children,
        className,
        cx,
        dispatch,
        initialize,
        namespace,
        onStatus,
        props,
        setState,
        state,
        unMounted,
    });
    const [handle, setNewHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    // Status change
    useEffect(() => {
        dispatch('status', { status: state.status }, onStatus);
        if (state.status === ENUMS.STATUS.PENDING) initialize();
    }, [state.status]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    //   The unMounted() function relies on containerRef.
    //   If it is not present, setState() will not execute.
    //   This could lead to your component rendering empty if you have a
    //   condition that checks state and renders null if certain conditions
    //   are not met.
    // -------------------------------------------------------------------------

    return (
        <div ref={containerRef} className={cx('container')}>
            <div className={cx()}>
                WelcomeWidget
                {children}
            </div>
        </div>
    );
};

WelcomeWidget = forwardRef(WelcomeWidget);

WelcomeWidget.ENUMS = ENUMS;

WelcomeWidget.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    onStatus: PropTypes.func,
};

WelcomeWidget.defaultProps = {
    namespace: 'namespace',
    onStatus: noop,
};

export { WelcomeWidget, WelcomeWidget as default };
