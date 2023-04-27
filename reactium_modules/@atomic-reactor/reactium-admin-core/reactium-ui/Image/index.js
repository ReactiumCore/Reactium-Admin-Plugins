import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import Breakpoint from '../Breakpoint';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const ENUMS = {
    DEBUG: false,
    EVENT: {
        COMPLETE: 'complete',
        LOAD: 'load',
    },
    STATUS: {
        COMPLETE: 'COMPLETE',
        LOADING: 'LOADING',
        PENDING: 'PENDING',
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Image
 * -----------------------------------------------------------------------------
 */
let Img = (
    {
        highRes,
        lowRes,
        onComplete,
        onLoad,
        onResize,
        preloader,
        src,
        iWindow,
        iDocument,
        ...otherProps
    },
    ref,
) => {
    const props = { ...otherProps };

    Object.keys(Img.propTypes).forEach(key => {
        delete props[key];
    });

    // Refs
    const containerRef = useRef();
    const stateRef = useRef({
        Q: {},
        prevState: {},
        highRes,
        images: {},
        lowRes,
        preloader,
        status: ENUMS.STATUS.PENDING,
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

        if (ENUMS.DEBUG === true && caller) {
            console.log('setState() ->', caller, stateRef.current);
        }

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const loadComplete = () => {
        const { Q = {} } = stateRef.current;

        if (Object.keys(Q).length < 1) {
            setState({ status: ENUMS.STATUS.COMPLETE }, 'loadComplete()');
            onComplete({ type: ENUMS.EVENT.COMPLETE });
        }
    };

    const loadImages = () => {
        const { Q = {}, images = {}, status } = stateRef.current;

        if (status === ENUMS.STATUS.LOADING) {
            return;
        }

        if (highRes) {
            Object.entries(highRes).forEach(([size, s]) => {
                const loader = new Image();

                loader.onload = function() {
                    op.set(images, size, renderImage(s));
                    delete Q[size];

                    onLoad({ type: ENUMS.EVENT.LOAD, url: s, queue: Q });

                    loadComplete();
                };
                loader.src = s;

                Q[size] = loader;
            });

            setState({ status: ENUMS.STATUS.LOADING, Q }, 'loadImages()');
        }
    };

    // External Interface
    useImperativeHandle(ref, () => ({
        breakpoint: op.get(containerRef.current, 'state.active', null),
        setState,
        state: stateRef.current,
        ...ref,
    }));

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useEffect(() => {
        const { status } = stateRef.current;

        switch (status) {
            case ENUMS.STATUS.PENDING:
                loadImages();
                break;
        }
    });

    // Renderers
    const renderComplete = () => {
        const { images = {} } = stateRef.current;
        return (
            <Breakpoint
                {...images}
                iWindow={iWindow}
                iDocument={iDocument}
                onResize={onResize}
                ref={containerRef}
            />
        );
    };

    const renderImage = s => {
        return (
            <img
                style={{ maxWidth: '100%', height: 'auto' }}
                {...props}
                src={s}
            />
        );
    };

    const renderLoading = () => {
        return lowRes ? (
            <Breakpoint
                iWindow={iWindow}
                iDocument={iDocument}
                onResize={onResize}
                ref={containerRef}
                {...Object.keys(lowRes).reduce((obj, size) => {
                    obj[size] = renderImage(lowRes[size]);
                    return obj;
                }, {})}
            />
        ) : null;
    };

    const renderPending = () => {
        const { preloader } = stateRef.current;
        return preloader || null;
    };

    const render = () => {
        if (src) {
            return rendeImage(src);
        }

        const { status } = stateRef.current;

        switch (status) {
            case ENUMS.STATUS.COMPLETE:
                return renderComplete();

            case ENUMS.STATUS.LOADING:
                return renderLoading();

            case ENUMS.STATUS.PENDING:
            default:
                return renderPending();
        }
    };

    return render();
};

Img = forwardRef(Img);

Img.propTypes = {
    highRes: PropTypes.shape(Breakpoint.propTypes),
    lowRes: PropTypes.shape(Breakpoint.propTypes),
    onComplete: PropTypes.func,
    onLoad: PropTypes.func,
    onResize: PropTypes.func,
    preloader: PropTypes.node,
    src: PropTypes.string,
};

Img.defaultProps = {
    onComplete: noop,
    onLoad: noop,
    onResize: noop,
};

export { Img as Image, Img as default };
