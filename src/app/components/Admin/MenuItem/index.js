import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useWindowSize } from '@atomic-reactor/reactium-ui/hooks';
import Reactium, { useHandle, useSelect } from 'reactium-core/sdk';
import { Collapsible, Icon, Prefs } from '@atomic-reactor/reactium-ui';
import useAbbreviatedNumber from 'components/common-ui/hooks/useAbbreviatedNumber';

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

const defaultIsActive = (match = {}, location = {}, src) => {
    const isExact = op.get(match, 'isExact', true);
    const url = op.get(match, 'url', '');
    const pathname = op.get(location, 'pathname', '/');

    if (isExact) {
        return url === pathname;
    } else {
        return String(pathname).startsWith(url);
    }
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: MenuItem
 * -----------------------------------------------------------------------------
 */
let MenuItem = ({ isActive, capabilities = [], children, ...props }, ref) => {
    if (!Reactium.User.can(capabilities)) {
        return null;
    }

    const match = useSelect(state => op.get(state, 'Router.match'), {});
    const pathname = useSelect(state => op.get(state, 'Router.pathname', '/'));

    const Sidebar = useHandle('AdminSidebar');

    const { width } = useWindowSize();

    // Refs
    const containerRef = useRef();
    const collapsibleRef = useRef();
    const stateRef = useRef({
        ...props,
    });

    const count = useAbbreviatedNumber(op.get(stateRef.current, 'count'));

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

        const { active } = stateRef.current;
        const expanded = op.get(Sidebar, 'state.expanded');

        if (!expanded && collapsibleRef.current) {
            collapsibleRef.current.expand();
            Sidebar.expand();
        } else {
            collapsibleRef.current.toggle();
        }
    };

    const cname = name => {
        const { namespace } = stateRef.current;
        return String(_.compact([namespace, name]).join('-')).toLowerCase();
    };

    const collapseSidebar = () => {
        const expanded = op.get(Sidebar, 'state.expanded');

        if (expanded === true && width <= 720) {
            Sidebar.collapse();
        }
    };

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useEffect(() => {
        const { count } = stateRef.current;

        const countNumber = useAbbreviatedNumber(count);
        setState({ countNumber });
    }, [op.get(stateRef.current, 'count')]);

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
        const { countNumber, icon, label } = stateRef.current;

        const Ico = icon
            ? typeof icon === 'string'
                ? () => <Icon name={icon} size={20} />
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
                {countNumber && (
                    <span className={cname('count')}>{countNumber}</span>
                )}
            </>
        );
    };

    const Link = () => {
        const { exact, route } = stateRef.current;
        return (
            <NavLink
                onClick={() => collapseSidebar()}
                exact={exact}
                className={cname('link')}
                to={route}
                isActive={isActive}>
                <Label />
            </NavLink>
        );
    };

    const Heading = () => {
        const { action = toggle, active } = stateRef.current;
        const classname = cn({ [cname('link')]: true, active });

        return (
            <button className={classname} onClick={action}>
                <Label />
            </button>
        );
    };

    const Content = () => (
        <div className={cname('content')}>
            <Collapsible
                ref={collapsibleRef}
                expanded={op.get(stateRef.current, 'active', true)}
                onCollapse={onCollapse}
                onExpand={onExpand}>
                {children}
            </Collapsible>
        </div>
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
    action: PropTypes.func,
    active: PropTypes.bool,
    capabilities: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    className: PropTypes.string,
    count: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.node,
    ]),
    exact: PropTypes.bool,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    id: PropTypes.string,
    isActive: PropTypes.func,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    namespace: PropTypes.string,
    route: PropTypes.string,
};

MenuItem.defaultProps = {
    active: false,
    capabilities: [],
    exact: true,
    isActive: defaultIsActive,
    namespace: 'menu-item',
};

export { MenuItem as default };
