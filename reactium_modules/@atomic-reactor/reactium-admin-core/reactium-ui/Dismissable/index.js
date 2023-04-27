import cn from 'classnames';
import PropTypes from 'prop-types';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';

import ENUMS from './enums';

import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
    useEffect,
} from 'react';

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Dismissable
 * -----------------------------------------------------------------------------
 */
let Dismissable = ({ children, ...props }, ref) => {
    // Refs
    const stateRef = useRef({
        prevState: {},
        ...props,
    });

    const containerRef = useRef();

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        // Get the previous state
        const prevState = { ...stateRef.current };

        // Update the stateRef
        stateRef.current = {
            ...prevState,
            ...newState,
            prevState,
        };

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const hide = () => {
        const { animation, visible } = stateRef.current;

        if (visible !== true) {
            setState({ animation: null });
            return Promise.resolve();
        }

        if (animation) {
            return animation;
        }

        const {
            animationEase,
            animationSpeed,
            onBeforeHide,
            onDismiss,
            onHide,
        } = stateRef.current;

        const container = containerRef.current;

        container.style.display = 'block';

        onBeforeHide({
            target: container,
            type: ENUMS.EVENT.BEFORE_HIDE,
        });

        const tween = new Promise(resolve =>
            TweenMax.to(container, animationSpeed, {
                ease: animationEase,
                opacity: 0,
                onComplete: () => {
                    const evt = {
                        target: container,
                        type: ENUMS.EVENT.HIDE,
                        state,
                    };

                    container.removeAttribute('style');
                    setState({ animation: null, visible: false });
                    onHide(evt);
                    onDismiss({ ...evt, type: ENUMS.EVENT.DISMISS });
                    resolve();
                },
            }),
        );

        setState({ animation: tween });

        return tween;
    };

    const show = () => {
        const { visible, animation } = stateRef.current;

        if (visible === true) {
            setState({ animation: null });
            return Promise.resolve();
        }

        if (animation) {
            return animation;
        }

        const {
            animationEase,
            animationSpeed,
            onBeforeShow,
            onShow,
        } = stateRef.current;

        const container = containerRef.current;

        container.style.display = 'block';
        container.classList.remove('visible');

        onBeforeShow({
            target: container,
            type: ENUMS.EVENT.BEFORE_SHOW,
        });

        const tween = new Promise(resolve =>
            TweenMax.to(container, animationSpeed, {
                ease: animationEase,
                opacity: 1,
                onComplete: () => {
                    const evt = {
                        target: container,
                        type: ENUMS.EVENT.SHOW,
                    };

                    container.removeAttribute('style');
                    setState({ visible: true, animation: null });
                    onShow(evt);
                    resolve();
                },
            }),
        );

        setState({ animation: tween });

        return tween;
    };

    const toggle = e => {
        const { visible } = stateRef.current;
        return visible !== true ? show(e) : hide(e);
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        hide,
        container: containerRef.current,
        show,
        setState,
        state: stateRef.current,
        toggle,
    }));

    useEffect(() => setState(props), Object.values(props));

    const render = () => {
        const { className, visible, namespace } = stateRef.current;

        const cname = cn({
            [className]: !!className,
            [namespace]: !!namespace,
            visible,
        });

        return (
            <div ref={containerRef} className={cname}>
                {children}
            </div>
        );
    };

    return render();
};

Dismissable = forwardRef(Dismissable);

Dismissable.ENUMS = ENUMS;

Dismissable.propTypes = {
    animationEase: PropTypes.object,
    animationSpeed: PropTypes.number,
    className: PropTypes.string,
    namespace: PropTypes.string,
    onBeforeHide: PropTypes.func,
    onBeforeShow: PropTypes.func,
    onDismiss: PropTypes.func,
    onHide: PropTypes.func,
    onShow: PropTypes.func,
    visible: PropTypes.bool,
};

Dismissable.defaultProps = {
    animationEase: Power2.easeInOut,
    animationSpeed: 0.25,
    namespace: 'ar-dismissable',
    onBeforeHide: noop,
    onBeforeShow: noop,
    onDismiss: noop,
    onHide: noop,
    onShow: noop,
    visible: false,
};

export { Dismissable, Dismissable as default };
