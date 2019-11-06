import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import { Collapsible, Prefs } from '@atomic-reactor/reactium-ui';
import { Plugins } from 'reactium-core/components/Plugable';
import { useSelect } from 'reactium-core/easy-connect';

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
 * Hook Component: Sidebar
 * -----------------------------------------------------------------------------
 */
let Sidebar = ({ children, Router, zone, section, ...props }, ref) => {
    // Refs
    const collapsibleRef = useRef();
    const containerRef = useRef();
    const stateRef = useRef({
        expanded: true,
        ...Prefs.get(zone),
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

    const onCollapse = () => {
        Prefs.set(zone, { expanded: false });
        setState({ expanded: false });
    };

    const onExpand = () => {
        Prefs.set(zone, { expanded: true });
        setState({ expanded: true });
    };

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    // Renderer
    const render = () => {
        const { expanded = true } = stateRef.current;

        return (
            <Collapsible
                ref={collapsibleRef}
                expanded={expanded}
                onCollapse={onCollapse}
                onExpand={onExpand}
                direction={Collapsible.ENUMS.DIRECTION.HORIZONTAL}>
                <div ref={containerRef} className={cx()}>
                    <Scrollbars
                        style={{
                            width: '100%',
                            height: '100vh',
                            overflowX: 'hidden',
                        }}>
                        <Plugins
                            zone={[zone, 'menu'].join('-')}
                            Router={Router}
                        />
                    </Scrollbars>
                    <Plugins
                        zone={[zone, 'footer'].join('-')}
                        Router={Router}
                    />
                </div>
            </Collapsible>
        );
    };

    const handle = () => ({
        container: containerRef.current,
        ref,
        setState,
        state: stateRef.current,
        toggle: () => collapsibleRef.current.toggle(),
        expand: () => collapsibleRef.current.expand(),
        collapse: () => collapsibleRef.current.collapse(),
    });

    // External Interface
    useImperativeHandle(ref, handle);

    useEffect(() => {
        window.Sidebar = handle();
    });

    // Render
    return render();
};

Sidebar = forwardRef(Sidebar);

Sidebar.ENUMS = ENUMS;

Sidebar.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

Sidebar.defaultProps = {
    namespace: 'admin-sidebar-container',
};

export { Sidebar as default };
