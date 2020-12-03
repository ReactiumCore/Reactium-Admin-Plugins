import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Icon } from '@atomic-reactor/reactium-ui';
import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

import Reactium, {
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHandle,
    useWindowSize,
} from 'reactium-core/sdk';

const defaultIsActive = (match = {}, location = {}) => {
    const url = op.get(match, 'url');
    let pathname = op.get(location, 'pathname');

    if (pathname === '/admin') return url === pathname;

    if (!url || !pathname) return false;
    if (url === pathname) return true;

    pathname = String(pathname).slice(0, -1);
    return String(url).startsWith(pathname);
};

const Label = ({ cname, expanded, state }) => {
    let { icon, label, title } = state;

    const countNumber = Reactium.Utils.abbreviatedNumber(
        op.get(state, 'count', 0),
    );

    const Ico = icon
        ? typeof icon === 'string'
            ? () => <Icon name={icon} size={20} />
            : () => icon
        : () => {
              return null;
          };

    title = title ? title : typeof label === 'string' ? label : null;

    const tip =
        expanded() || !title
            ? {}
            : {
                  title,
                  'data-align': 'right',
                  'data-tooltip': title,
                  'data-vertical-align': 'middle',
              };

    return (
        <>
            <span className={cname('icon')} {...tip}>
                <Ico />
            </span>
            <span className={cname('label')}>{label}</span>
            {countNumber && (
                <span className={cname('count')}>{countNumber}</span>
            )}
        </>
    );
};

const Heading = ({ state, hideTooltip, cname, expanded }) => {
    const { active = false, add, onClick } = state;
    const classname = cn({ [cname('link')]: true, active });
    const _onClick = e => {
        hideTooltip(e);
        onClick(e);
    };
    return (
        <div className={classname}>
            {onClick && (
                <button onClick={_onClick}>
                    <Label cname={cname} expanded={expanded} state={state} />
                </button>
            )}
            {!onClick && (
                <div>
                    <Label cname={cname} expanded={expanded} state={state} />
                </div>
            )}
            {add && (
                <NavLink to={add} className={cname('add')}>
                    <Icon name='Feather.Plus' />
                </NavLink>
            )}
        </div>
    );
};

const Link = ({ state, cname, onClick, expanded }) => {
    const { active, add, route } = state;
    const classname = cn({ [cname('link')]: true, active });

    return (
        <div className={classname}>
            <NavLink to={route} onClick={onClick}>
                <Label cname={cname} expanded={expanded} state={state} />
            </NavLink>
            {add && (
                <NavLink to={add} className={cname('add')}>
                    <Icon name='Feather.Plus' />
                </NavLink>
            )}
        </div>
    );
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: MenuItem
 * -----------------------------------------------------------------------------
 */
let MenuItem = ({ children, capabilities = [], ...props }, ref) => {
    const watchProps = ['icon', 'label', 'updated'];

    const match = op.get(Reactium.Routing, 'currentRoute.match.match');
    const pathname = op.get(
        Reactium.Routing,
        'currentRoute.location.pathname',
        '/',
    );

    const Sidebar = useHandle('AdminSidebar');

    const Tools = useHandle('AdminTools');

    const { breakpoint } = useWindowSize({ delay: 0 });

    const isActive = (match, location) => {
        if (op.has(props, 'isActive')) {
            return props.isActive(match, location);
        } else {
            return defaultIsActive(match, location);
        }
    };

    // Refs
    const containerRef = useRef();

    // State
    const [state, updateState] = useDerivedState({
        ...props,
        permitted: false,
    });

    const setState = newState => {
        if (unMounted()) return;
        updateState(newState);
    };

    const unMounted = () => !containerRef.current;

    const cx = () => {
        const { className, namespace } = state;
        return cn({ [className]: !!className, [namespace]: !!namespace });
    };

    const hideTooltip = e => {
        if (e) {
            const hasTooltip = !!e.target.getAttribute('data-tooltip');
            if (hasTooltip) {
                Tools.Tooltip.hide(e);
            }
        }
    };

    const expanded = () => Sidebar.isExpanded();

    const cname = name => {
        const { namespace } = state;
        return String(_.compact([namespace, name]).join('-')).toLowerCase();
    };

    const collapseSidebar = e => {
        hideTooltip(e);
        const breaks = ['xs', 'sm'];
        if (breaks.includes(breakpoint)) {
            //_.defer(Sidebar.collapse);
            Sidebar.collapse();
        }
    };

    // Handle
    const _handle = () => ({
        expanded,
        state,
        setState,
        Sidebar,
    });

    const [handle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    // Side Effects

    // Props to state update
    useEffect(
        () => {
            const newState = {};

            watchProps.forEach(key => {
                if (op.get(props, key) === op.get(state, key)) return;
                op.set(newState, key, op.get(props, key));
            });

            if (Object.keys(newState).length > 0) setState(newState);
        },
        watchProps.map(key => op.get(props, key)),
    );

    // Permitted
    useAsyncEffect(async mounted => {
        if (!capabilities || capabilities.length < 1) {
            updateState({ permitted: true });
            return;
        }

        const allowed = await Reactium.User.can(capabilities, false);
        if (mounted()) updateState({ permitted: allowed });
    }, []);

    // Count
    useEffect(() => {
        setState({ count: props.count });
    }, [props.count]);

    // Active
    useEffect(() => {
        const { active, route } = state;
        const location = { pathname: route };
        const newActive = isActive(match, location);
        if (active !== newActive) setState({ active: newActive });
    }, [match, pathname, op.get(state, 'route'), op.get(state, 'active')]);

    // Renderer
    return !state.permitted ? null : (
        <div ref={containerRef} className={cx()}>
            <div className={cname('row')}>
                {state.route ? (
                    <Link
                        match={match}
                        pathname={pathname}
                        state={state}
                        cname={cname}
                        isActive={isActive}
                        onClick={collapseSidebar}
                        expanded={expanded}
                    />
                ) : (
                    <Heading
                        state={state}
                        hideTooltip={hideTooltip}
                        cname={cname}
                        expanded={expanded}
                    />
                )}
                {children && (
                    <div
                        className={cn({
                            [cname('content')]: true,
                            active: state.active,
                        })}>
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
};

MenuItem = forwardRef(MenuItem);

MenuItem.propTypes = {
    active: PropTypes.bool,
    add: PropTypes.string,
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
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    namespace: PropTypes.string,
    onClick: PropTypes.func,
    route: PropTypes.string,
    title: PropTypes.string,
};

MenuItem.defaultProps = {
    active: false,
    capabilities: [],
    exact: true,
    isActive: defaultIsActive,
    namespace: 'menu-item',
};

export { MenuItem as default };

/**
 * @api {RegisteredComponent} <MenuItem/> MenuItem
 * @apiDescription Component used for Sidebar elements.
 * @apiName MenuItem
 * @apiGroup Registered Component
 * @apiParam {Mixed} label The `{String}` or `{Component}` to display.
 * @apiParam {Boolean} [active=false] If the MenuItem should display as an active item.
 * @apiParam {Array} [capabilities] List of capabilities that are allowed to access the MenuItem.
 * @apiParam {String} [className] React className to apply to the component container.
 * @apiParam {Number} [count] Indicator that shows a number of items relative to the MenuItem group.
 * @apiParam {Boolean} [exact=true] Used by the default isActive function to determine if the MenuItem is active using an exact route match.
 * @apiParam {Mixed} [icon] Display an Icon for the MenuItem. The icon can be any valid `PropTypes.node` value or any `<Icon />` name.
 * @apiParam {String} [id] Unique id for the MenuItem. If the id is specified, it's content expanded/collapsed state is saved to localStorage.
 * @apiParam {Function} [isActive] Function that determines if the MenuItem is active. The `Router.match` and `Router.location` values are passed as parameters for the function.
 * @apiParam {Function} [onClick] Function to execute when the MenuItem is clicked.
 * @apiParam {String} [route] Navigate to the specified route when the MenuItem is clicked. _Note: the `onClick` function will execute as well._
 * @apiParam {String} [title] Tooltip to dislay for the MenuItem. If empty and the `label` is a `{String}` the `label` value is used.
 * @apiExample Simple Usage:
import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';

const SidebarWidget = () => (
    const MenuItem = useHookComponent('MenuItem');
    <MenuItem
        label='Dashboard'
        icon='Linear.Window'
        route='/admin'
    />
);

  * @apiExample Sub MenuItems:
import MenuItem from 'reactium_modules/@atomic-reactor/admin/registered-components/MenuItem';

const SidebarWidget = () => (
  <MenuItem
    icon='Linear.Equalizer'
    id='admin-sidebar-settings'
    label='Settings'>
    <MenuItem
      label='App'
      route='/admin/settings/app'
      title='Application settings'
    />
    <MenuItem
      label='Email'
      route='/admin/settings/email'
      title='Email settings'
    />
  </MenuItem>
);

 * @apiExample Component Zone:
import MenuItem from 'reactium_modules/@atomic-reactor/admin/registered-components/MenuItem';
import { Zone } from 'reactium-core/sdk';

const SidebarWidget = () => (
  <MenuItem
    icon='Linear.Equalizer'
    id='admin-sidebar-settings'
    label='Settings' >
    <Zone zone='admin-sidebar-settings' />
  </MenuItem>
);

 * @apiExample Import
import MenuItem from 'reactium_modules/@atomic-reactor/admin/registered-components/MenuItem';

 * @apiExample Dependencies
import { NavLink } from 'react-router-dom';
import { Collapsible, Icon, Prefs } from '@atomic-reactor/reactium-ui';
import Reactium, { useHandle, useSelect, useWindowSize } from 'reactium-core/sdk';
 */
