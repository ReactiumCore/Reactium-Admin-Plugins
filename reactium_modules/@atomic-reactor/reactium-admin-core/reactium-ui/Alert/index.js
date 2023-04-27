import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import PropTypes from 'prop-types';
import Button from 'reactium-ui/Button';
import { Feather } from 'reactium-ui/Icon';
import Dismissable from 'reactium-ui/Dismissable';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const ENUMS = {
    ...Dismissable.ENUMS,
    COLOR: { ...Button.ENUMS.COLOR },
};

delete ENUMS.COLOR.CLEAR;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Alert
 * -----------------------------------------------------------------------------
 */
let Alert = ({ children, id, ...props }, ref) => {
    // Refs
    const containerRef = useRef();
    const stateRef = useRef({
        timer: null,
        ...props,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        stateRef.current = { ...stateRef.current, ...newState };
        if (!containerRef.current) return;
        setNewState(stateRef.current);
    };

    const _onDismiss = e => {
        const { onDismiss } = stateRef.current;
        setState({ visible: false });
        onDismiss(e);
    };

    const _pause = () => {
        let { autoDismiss, dismissable, timer } = stateRef.current;

        if (!autoDismiss || !dismissable || !timer) {
            return;
        }

        clearTimeout(timer);
    };

    const _start = () => {
        let { autoDismiss, dismissable, timer } = stateRef.current;
        clearTimeout(timer);

        if (!autoDismiss || !dismissable) {
            return;
        }

        autoDismiss *= 1000;

        timer = setTimeout(() => {
            containerRef.current.hide();
            clearTimeout(timer);
        }, autoDismiss);

        setState({ timer });
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        ...containerRef.current,
        setState,
        state: stateRef.current,
    }));

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useLayoutEffect(() => _start(), [state.autoDismiss, state.dismissable]);

    const render = () => {
        const {
            className,
            color,
            dismissable,
            icon,
            namespace,
            timer,
            visible,
        } = stateRef.current;

        if (!visible) {
            if (timer) {
                clearTimeout(timer);
            }
            return null;
        }

        const cname = cn({
            [color]: !!color,
            [className]: !!className,
            [namespace]: !!namespace,
            visible: !dismissable && visible === true,
        });

        const Content = () => (
            <div
                id={id}
                ref={!dismissable ? containerRef : null}
                onMouseOver={_pause}
                onMouseOut={_start}
                className={cname}>
                {icon && <span className='ico'>{icon}</span>}
                <span className='content'>{children}</span>
                {dismissable && (
                    <button
                        type='button'
                        className='dismiss'
                        onClick={() => containerRef.current.hide()}>
                        <Feather.X />
                    </button>
                )}
            </div>
        );

        const dprops = { ...stateRef.current };
        delete dprops.autoDismiss;
        delete dprops.className, delete dprops.color;
        delete dprops.dismissable;
        delete dprops.icon;
        delete dprops.id;
        delete dprops.namespace;

        return dismissable === true ? (
            <Dismissable
                {...dprops}
                visible={visible}
                ref={containerRef}
                onDismiss={_onDismiss}>
                <Content />
            </Dismissable>
        ) : (
            <Content />
        );
    };

    return render();
};

Alert = forwardRef(Alert);

Alert.ENUMS = ENUMS;

Alert.propTypes = {
    ...Dismissable.propTypes,
    autoDismiss: PropTypes.number,
    color: PropTypes.oneOf(Object.values(ENUMS.COLOR)),
    dismissable: PropTypes.bool,
    icon: PropTypes.node,
};

Alert.defaultProps = {
    ...Dismissable.defaultProps,
    color: ENUMS.COLOR.PRIMARY,
    dismissable: false,
    icon: <Feather.Info />,
    id: uuid(),
    namespace: 'ar-alert',
    visible: true,
};

export { Alert, Alert as default };
