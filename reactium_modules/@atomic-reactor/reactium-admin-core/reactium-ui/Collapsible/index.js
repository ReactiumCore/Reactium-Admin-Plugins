import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { TweenMax, Power2 } from 'gsap/umd/TweenMax';
import { useEventHandle } from '@atomic-reactor/reactium-sdk-core';

import ENUMS from './enums';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const noop = () => {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Collapsible
 * -----------------------------------------------------------------------------
 */
// export class ResizeEvent extends Event {
//     constructor(type, data) {
//         super(type, data);
//
//         op.del(data, 'type');
//         op.del(data, 'target');
//
//         Object.entries(data).forEach(([key, value]) => {
//             if (!this[key]) {
//                 try {
//                     this[key] = value;
//                 } catch (err) {}
//             } else {
//                 key = `__${key}`;
//                 this[key] = value;
//             }
//         });
//     }
// }

let Collapsible = ({ debug, children, ...props }, ref) => {
    // Refs
    const stateRef = useRef({
        ...props,
        init: false,
    });

    const containerRef = useRef();

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        if (!containerRef.current) return;

        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const numberize = str => Number(String(str).replace(/[a-z]/g, ''));

    const collapse = () => {
        const { animation, expanded } = stateRef.current;

        if (expanded !== true) {
            setState({ animation: null });
            return Promise.resolve();
        }

        if (animation) {
            return animation;
        }

        const {
            animationEase,
            animationSpeed,
            direction,
            maxSize,
            minSize,
            onBeforeCollapse,
            onCollapse,
        } = stateRef.current;

        const container = containerRef.current;
        const dir =
            direction === ENUMS.DIRECTION.HORIZONTAL ? 'width' : 'height';

        if (!maxSize) {
            container.style[dir] = 'auto';
        }
        container.style.display = 'block';
        container.style.overflow = 'hidden';

        const to = minSize ? numberize(minSize) : 0;

        handle.rect = container.getBoundingClientRect();
        handle.dispatchEvent(new Event('before-collapse'));

        onBeforeCollapse({
            target: container,
            type: ENUMS.EVENT.BEFORE_COLLAPSE,
        });

        const tween = new Promise(resolve =>
            TweenMax.to(container, animationSpeed, {
                [dir]: to,
                ease: animationEase,
                onUpdate: () => {
                    handle.rect = container.getBoundingClientRect();
                    handle.dispatchEvent(new Event('resize'));
                },
                onComplete: () => {
                    if (!containerRef.current) return;

                    const evt = {
                        target: container,
                        type: ENUMS.EVENT.COLLAPSE,
                    };

                    setState({ animation: null, expanded: false });

                    container.removeAttribute('style');

                    if (minSize) {
                        container.style.display = 'block';
                        container.style[dir] = numberize(minSize) + 'px';
                    }

                    handle.rect = container.getBoundingClientRect();
                    handle.dispatchEvent(new Event('collapse'));
                    onCollapse(evt);
                    resolve();
                },
            }),
        );

        setState({ animation: tween });

        return tween;
    };

    const expand = () => {
        const { animation, expanded } = stateRef.current;

        if (expanded === true) {
            setState({ animation: null });
            return Promise.resolve();
        }

        if (animation) {
            return animation;
        }

        const {
            animationEase,
            animationSpeed,
            direction,
            onBeforeExpand,
            onExpand,
            maxSize,
            minSize,
        } = stateRef.current;

        const container = containerRef.current;
        if (!container) {
            return Promise.resolve();
        }

        const dir =
            direction === ENUMS.DIRECTION.HORIZONTAL ? 'width' : 'height';

        container.classList.add('expanded');
        container.style[dir] = maxSize ? numberize(maxSize) + 'px' : 'auto';
        container.style.display = 'block';
        container.style.overflow = 'hidden';

        handle.rect = container.getBoundingClientRect();
        handle.dispatchEvent(new Event('before-expand'));
        onBeforeExpand({
            target: container,
            type: ENUMS.EVENT.BEFORE_EXPAND,
        });

        const tween = new Promise(resolve =>
            TweenMax.from(container, animationSpeed, {
                [dir]: numberize(minSize),
                ease: animationEase,
                onUpdate: () => {
                    handle.rect = container.getBoundingClientRect();
                    handle.dispatchEvent(new Event('resize'));
                },
                onComplete: () => {
                    if (!containerRef.current) return;

                    const evt = {
                        target: container,
                        type: ENUMS.EVENT.EXPAND,
                    };
                    setState({ expanded: true, animation: null });

                    container.removeAttribute('style');

                    if (maxSize) {
                        container.style[dir] = numberize(maxSize) + 'px';
                    }
                    handle.rect = container.getBoundingClientRect();
                    handle.dispatchEvent(new Event('expand'));
                    onExpand(evt);
                    resolve();
                },
            }),
        );

        setState({ animation: tween });

        return tween;
    };

    const toggle = e => {
        const { expanded } = stateRef.current;
        return expanded !== true ? expand(e) : collapse(e);
    };

    const setSize = () => {
        const { direction, expanded, maxSize, minSize } = stateRef.current;

        if (maxSize || minSize) {
            const container = containerRef.current;

            const dir =
                direction === ENUMS.DIRECTION.HORIZONTAL ? 'width' : 'height';

            if (expanded && maxSize) {
                container.style[dir] = numberize(maxSize) + 'px';
            }

            if (expanded !== true && minSize) {
                let size = numberize(minSize);
                size = size === 1 ? 0 : size;

                container.style[dir] = size + 'px';
                container.style.display = size !== 0 ? 'block' : 'none';
            }
        }
    };

    const _handle = () => ({
        collapse,
        container: containerRef.current,
        expand,
        rect: {},
        setState,
        state: stateRef.current,
        toggle,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    // External Interface
    useImperativeHandle(ref, () => handle, [stateRef.current]);

    useEffect(() => setState(props), Object.values(props));

    useEffect(() => {
        const { init, maxSize } = stateRef.current;

        if (!init) {
            setSize();
            setState({ init: true });
        }

        if (typeof window === 'undefined') {
            return;
        }

        window.addEventListener('resize', setSize);

        return () => window.removeEventListener('resize', setSize);
    }, [
        op.get(stateRef, 'current.init'),
        Number(op.get(stateRef, 'current.maxSize', 0)),
        Number(op.get(stateRef, 'current.minSize', 0)),
    ]);

    useEffect(() => {
        if (!containerRef.current) return;
        setHandle(_handle());
    }, [stateRef.current]);

    const render = () => {
        let {
            className,
            expanded,
            namespace,
            width,
            height,
            style = {},
        } = stateRef.current;

        className = cn({
            [className]: !!className,
            [namespace]: true,
            expanded,
        });

        return (
            <div ref={containerRef} className={className} style={style}>
                {children}
            </div>
        );
    };

    return render();
};

Collapsible = forwardRef(Collapsible);

Collapsible.ENUMS = ENUMS;

Collapsible.propTypes = {
    animationEase: PropTypes.object,
    animationSpeed: PropTypes.number,
    className: PropTypes.string,
    debug: PropTypes.bool,
    direction: PropTypes.oneOf(Object.values(ENUMS.DIRECTION)),
    expanded: PropTypes.bool,
    maxSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    minSize: PropTypes.number,
    namespace: PropTypes.string,
    onBeforeCollapse: PropTypes.func,
    onBeforeExpand: PropTypes.func,
    onCollapse: PropTypes.func,
    onExpand: PropTypes.func,
    style: PropTypes.object,
};

Collapsible.defaultProps = {
    animationEase: Power2.easeInOut,
    animationSpeed: 0.25,
    className: null,
    debug: false,
    direction: ENUMS.DIRECTION.VERTICAL,
    expanded: true,
    namespace: 'ar-collapsible',
    onBeforeCollapse: noop,
    onBeforeExpand: noop,
    onCollapse: noop,
    onExpand: noop,
    style: {},
};

export { Collapsible, Collapsible as default };
