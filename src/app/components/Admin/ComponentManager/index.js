import SDK from './sdk';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

import Reactium, {
    ComponentEvent,
    Zone,
    useDerivedState,
    useEventHandle,
    useRegisterHandle,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

import React, { forwardRef, useImperativeHandle, useEffect } from 'react';

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
 * Hook Component: ComponentManager
 * -----------------------------------------------------------------------------
 */
let ComponentManager = (
    { children, className, namespace, onStatus, ...props },
    ref,
) => {
    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const refs = useRefs();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const [state, update] = useDerivedState({
        components: SDK.list(),
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    // -------------------------------------------------------------------------
    // Status
    // -------------------------------------------------------------------------
    const [status, setStatus, isStatus] = useStatus(ENUMS.STATUS.PENDING);

    // -------------------------------------------------------------------------
    // Internal Interface
    // -------------------------------------------------------------------------

    // cx(suffix:String);
    const cx = Reactium.Utils.cxFactory(className || namespace);

    // dispatch(eventType:String, event:Object, callback:Function);
    const dispatch = async (eventType, event = {}, callback) => {
        if (!_.isObject(event)) {
            throw new Error(
                'dispatch expectes 2nd parameter to be of type Object',
            );
        }

        eventType = String(eventType).toLowerCase();

        const evt = new ComponentEvent(eventType, event);

        handle.dispatchEvent(evt);

        if (unMounted()) return;
        await Reactium.Hook.run(`component-manager-${eventType}`, evt, handle);

        if (unMounted()) return;
        if (typeof callback === 'function') await callback(evt);
    };

    // initialize();

    const initialize = async () => {
        // SET STATUS TO INITIALIZING
        setStatus(ENUMS.STATUS.INITIALIZING);

        // DO YOUR INITIALIZATION HERE
        const components = await SDK.list(true);

        // SET STATUS TO INITIALIZED WHEN COMPLETE
        _.delay(() => {
            setStatus(ENUMS.STATUS.READY);
            setState({ fetched: Date.now(), components });
        }, 500);

        return components;
    };

    const save = () => {
        console.log('save');
    };

    // unMounted();
    const unMounted = () => !refs.get('container');

    const _onStatusChange = () => {
        dispatch('status', { status }, onStatus);

        switch (status) {
            case ENUMS.STATUS.PENDING:
                initialize();
                break;
        }
    };

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _handle = () => ({
        ENUMS,
        children,
        className,
        cx,
        dispatch,
        initialize,
        isStatus,
        namespace,
        props,
        save,
        setState,
        setStatus,
        state,
        status,
        unMounted,
    });
    const [handle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    useRegisterHandle('ComponentManager', () => handle, [handle]);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------
    // Status change
    useEffect(_onStatusChange, [status]);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className={cx()}>
            <div className={cx('list')} ref={elm => refs.set('container', elm)}>
                Component List
            </div>
        </div>
    );
};

ComponentManager = forwardRef(ComponentManager);

ComponentManager.ENUMS = ENUMS;

ComponentManager.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    onStatus: PropTypes.func,
};

ComponentManager.defaultProps = {
    namespace: 'admin-components',
    onStatus: noop,
};

export { ComponentManager, ComponentManager as default };
