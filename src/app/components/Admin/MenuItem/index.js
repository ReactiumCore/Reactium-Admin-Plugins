import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useSelect } from 'reactium-core/sdk';
import { Collapsible, Icon, Prefs } from '@atomic-reactor/reactium-ui';

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

const ENUMS = {
    DEBUG: false,
};

const defaultIsActive = (match, location, src) => {
    const { isExact, url } = match;
    const { pathname } = location;

    return isExact ? url === pathname : String(pathname).startsWith(url);
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: MenuItem
 * -----------------------------------------------------------------------------
 */
let MenuItem = ({ isActive, children, ...props }, ref) => {
    const match = useSelect(state => op.get(state, 'Router.match'), {});
    const pathname = useSelect(state => op.get(state, 'Router.pathname', '/'));

    // Refs
    const containerRef = useRef();
    const collapsibleRef = useRef();
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

    const onCollapse = () => {
        const { id, route } = stateRef.current;
        if (!route) {
            if (id) {
                Prefs.set(`admin.sidebar.menu.${id}`, false);
            }
            setState({ active: false });
        }
    };

    const onExpand = () => {
        const { id, route } = stateRef.current;
        if (!route) {
            if (id) {
                Prefs.set(`admin.sidebar.menu.${id}`, true);
            }
            setState({ active: true });
        }
    };

    const toggle = () => {
        if (!collapsibleRef.current) {
            return;
        }

        collapsibleRef.current.toggle();
    };

    const cname = name => {
        const { namespace } = stateRef.current;
        return String(_.compact([namespace, name]).join('-')).toLowerCase();
    };

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useEffect(() => {
        let { active, id, init, route } = stateRef.current;

        if (route) {
            const location = { pathname: route };
            const newActive = isActive(match, location, 'useEffect');

            if (active !== newActive) {
                setState({ active: newActive });
            }
        } else {
            if (id) {
                const pref = Prefs.get(`admin.sidebar.menu.${id}`);
                const newActive = typeof pref === 'boolean' ? pref : active;

                if (active !== newActive) {
                    setState({ active: newActive });
                }
            }
        }

        setState({ init: true });
    }, [
        match,
        op.get(stateRef.current, 'active'),
        op.get(stateRef.current, 'route'),
        op.get(stateRef.current, 'id'),
    ]);

    const Label = () => {
        const { icon, label } = stateRef.current;

        const Ico = icon
            ? typeof icon === 'string'
                ? () => <Icon name={icon} />
                : () => icon
            : () => {
                  return null;
              };

        return (
            <>
                <span className={cname('icon')}>
                    <Ico />
                </span>
                <span className={cname('label')}>{label}</span>
            </>
        );
    };

    const Link = () => {
        const { route } = stateRef.current;
        return (
            <NavLink className={cname('link')} to={route} isActive={isActive}>
                <Label />
            </NavLink>
        );
    };

    const Heading = () => {
        return (
            <button className={cname('link')} onClick={toggle}>
                <Label />
            </button>
        );
    };

    const Content = () => (
        <Collapsible
            ref={collapsibleRef}
            expanded={op.get(stateRef.current, 'active', true)}
            onCollapse={onCollapse}
            onExpand={onExpand}>
            {children}
        </Collapsible>
    );

    // Renderer
    const render = () => {
        const { route } = stateRef.current;

        return (
            <div ref={containerRef} className={cx()}>
                <div className={cname('row')}>
                    {route ? <Link /> : <Heading />}
                    {children && <Content />}
                </div>
            </div>
        );
    };

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

MenuItem = forwardRef(MenuItem);

MenuItem.ENUMS = ENUMS;

MenuItem.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    id: PropTypes.string,
    isActive: PropTypes.func,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    namespace: PropTypes.string,
    route: PropTypes.string,
};

MenuItem.defaultProps = {
    active: false,
    isActive: defaultIsActive,
    namespace: 'menu-item',
};

export { MenuItem as default };
