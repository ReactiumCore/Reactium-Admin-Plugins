import PropTypes from 'prop-types';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const DEBUG = false;

const getBreakpoints = (win = window, doc = window.document) =>
    new Promise(resolve => {
        let bps = {};
        const queries = String(
            win
                .getComputedStyle(doc.querySelector('body'), ':before')
                .getPropertyValue('content'),
        ).replace(/\'/g, '"');

        if (queries && queries !== 'none') {
            try {
                bps = JSON.parse(queries);

                if (typeof bps === 'string') {
                    bps = JSON.parse(bps);
                }
            } catch (err) {
                // left intentionally blank
            }
        }

        resolve(
            Object.entries(bps).reduce((bps, [key, mediaQuery]) => {
                bps[key] = win.matchMedia(mediaQuery).matches;
                return bps;
            }, {}),
        );
    });

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Breakpoint
 * -----------------------------------------------------------------------------
 */
let Breakpoint = ({ iDocument, iWindow, ...props }, ref) => {
    // Refs
    const containerRef = useRef();
    const stateRef = useRef({
        active: 'xs',
        mounted: false,
        prevState: {},
        ...props,
    });

    // State
    const [state, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = (newState, caller) => {
        // Get the previous state
        const prevState = { ...stateRef.current };

        // Update the stateRef
        stateRef.current = {
            ...prevState,
            ...newState,
            prevState,
        };

        if (DEBUG === true && caller) {
            console.log('setState() ->', caller, stateRef.current);
        }

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        setState,
        state: stateRef.current,
    }));

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useEffect(() => {
        const { mounted } = stateRef.current;
        if (mounted === true) {
            return;
        }
        const win = iWindow || window;
        win.addEventListener('resize', _onResize);
        setState({ mounted: true });
    });

    useLayoutEffect(() => {
        _onResize();
    });

    const _onResize = async e => {
        const doc = iDocument || document;
        const win = iWindow || window;

        if (!win || !doc) {
            return;
        }

        let {
            active = 'xs',
            breaks = Breakpoint.defaultProps,
            onResize,
        } = stateRef.current;

        const breakpoints = await getBreakpoints(win, doc);

        if (!breakpoints) {
            return;
        }

        let newActive = breaks.reduce((act, bp) => {
            if (
                act === null &&
                breakpoints[bp] &&
                typeof props[bp] !== 'undefined'
            ) {
                act = bp;
            }
            return act;
        }, null);

        if (active !== newActive) {
            setState({ active: newActive }, '_onResize()');
            e = e || { type: 'resize' };
            onResize({ ...e, breakpoint: newActive });
        }
    };

    const render = () => {
        const { active } = stateRef.current;

        if (props[active]) {
            return props[active];
        } else {
            return null;
        }
    };

    return render();
};

Breakpoint = forwardRef(Breakpoint);

Breakpoint.propTypes = {
    xs: PropTypes.node,
    sm: PropTypes.node,
    md: PropTypes.node,
    lg: PropTypes.node,
    xl: PropTypes.node,
    breaks: PropTypes.array,
    onResize: PropTypes.func,
};

Breakpoint.defaultProps = {
    xs: undefined,
    sm: undefined,
    md: undefined,
    lg: undefined,
    xl: undefined,
    breaks: ['xl', 'lg', 'md', 'sm', 'xs'],
    onResize: noop,
};

Breakpoint.getBreakpoints = getBreakpoints;

export { Breakpoint, Breakpoint as default, getBreakpoints };
