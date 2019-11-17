import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { useHandle } from 'reactium-core/sdk';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const ENUMS = {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Media
 * -----------------------------------------------------------------------------
 */
let Media = ({ children, ...props }, ref) => {
    const SearchBar = useHandle('SearchBar');

    // Refs
    const containerRef = useRef();
    const stateRef = useRef({
        ...props,
    });

    // State
    const [, setNewState] = useState(stateRef.current);

    // Internal Interface
    const setState = newState => {
        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        // Trigger useEffect()
        setNewState(stateRef.current);
    };

    const cx = () => {
        const { className, namespace } = stateRef.current;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    // Renderer
    const render = () => {
        return <div ref={containerRef}>Media</div>;
    };

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useEffect(() => SearchBar.setState({ visible: true }), [
        op.get(SearchBar, 'visible'),
    ]);

    // External Interface
    useImperativeHandle(ref, () => ({
        container: containerRef.current,
        ref,
        setState,
        state: stateRef.current,
    }));

    // Render
    return render();
};

Media = forwardRef(Media);

Media.ENUMS = ENUMS;

Media.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

Media.defaultProps = {
    namespace: 'admin-media-library',
};

export { Media as default };
