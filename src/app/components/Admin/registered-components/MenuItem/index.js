import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Collapsible, Icon, Prefs } from '@atomic-reactor/reactium-ui';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import Reactium, {
    useHandle,
    useSelect,
    useWindowSize,
} from 'reactium-core/sdk';

const defaultIsActive = (match = {}, location = {}, src) => {
    const url = op.get(match, 'url');
    let pathname = op.get(location, 'pathname');

    if (pathname === '/admin') return url === pathname;

    if (!url || !pathname) return false;
    if (url === pathname) return true;

    pathname = String(pathname).slice(0, -1);
    return String(url).startsWith(pathname);
};

const Label = ({ cname, expanded, state }) => {
    let { add, countNumber, icon, label, title } = state;

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
    const { active = false, add, label, onClick } = state;
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
    const { active, add, exact, route, label } = state;
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
let MenuItem = ({ children, count, capabilities = [], ...props }) => {
    const prevChildren = useRef(React.Children.toArray(children));

    const match = useSelect(state => op.get(state, 'Router.match'));
    const pathname = useSelect(state => op.get(state, 'Router.pathname', '/'));

    const Sidebar = useHandle('AdminSidebar');

    const Tools = useHandle('AdminTools');

    const { width, breakpoint } = useWindowSize({ delay: 0 });

    const isActive = (match, location) => {
        // const url = op.get(match, 'url');
        // const path = op.get(location, 'pathname');
        // const { route } = state;
        //
        // if (url === path) { return true; }

        if (op.has(props, 'isActive')) {
            return props.isActive(match, location);
        } else {
            return defaultIsActive(match, location);
        }
    };

    // Refs
    const containerRef = useRef();

    // State
    const [permitted, setPermitted] = useState(false);
    const [state, setNewState] = useState(props);
    const setState = newState => setNewState({ ...state, ...newState });

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

    const expanded = () =>
        op.get(Sidebar, 'state.status') === Sidebar.ENUMS.STATUS.EXPANDED;

    const cname = name => {
        const { namespace } = state;
        return String(_.compact([namespace, name]).join('-')).toLowerCase();
    };

    const collapseSidebar = e => {
        hideTooltip(e);

        if (expanded() && ['xs', 'sm'].includes(breakpoint)) {
            Sidebar.collapse();
        }
    };

    // Side Effects
    useEffect(() => {
        const newState = {};
        const keys = ['label', 'updated'];

        keys.forEach(key => {
            if (op.get(props, key) === op.get(state, key)) return;
            op.set(newState, key, op.get(props, key));
        });

        if (Object.keys(newState).length > 0) setState(newState);
    }, [op.get(props, 'label'), op.get(props, 'updated')]);

    // Permiitted
    useEffect(() => {
        if (!capabilities || capabilities.length < 1) {
            const timeout = setTimeout(() => setPermitted(true), 1);
            return () => {
                clearTimeout(timeout);
            };
        }

        Reactium.User.can(capabilities, false).then(allowed => {
            if (permitted !== allowed) {
                setPermitted(allowed);
            }
        });
    }, []);

    // Count
    useEffect(() => {
        const countNumber = Reactium.Utils.abbreviatedNumber(count);
        if (state.countNumber !== countNumber) {
            const timeout = setTimeout(() => setState({ countNumber }), 1);
            return () => {
                clearTimeout(timeout);
            };
        }
    }, [count]);

    // Active
    useEffect(() => {
        const { active, route } = state;
        const location = { pathname: route };
        const newActive = isActive(match, location);
        if (active !== newActive) {
            let timeout = setTimeout(() => setState({ active: newActive }), 1);
            return () => clearTimeout(timeout);
        }
    }, [match, pathname, op.get(state, 'route'), op.get(state, 'active')]);
    // useEffect(() => {
    // const { active, route } = state;
    //
    // if (!match) {
    //     if (active !== false) {
    //         let timeout = setTimeout(() => setState({ active: false }), 1);
    //         return () => clearTimeout(timeout);
    //     }
    //     return;
    // }
    //
    // if (!route && !isActive) {
    //     if (active !== false) {
    //         let timeout = setTimeout(() => setState({ active: false }), 1);
    //         return () => clearTimeout(timeout);
    //     }
    //     return;
    // }
    //
    // const location = { pathname };
    // const newActive = isActive(match, location);
    // if (active !== newActive) {
    //     let timeout = setTimeout(() => setState({ active: newActive }), 1);
    //     return () => clearTimeout(timeout);
    // }
    // }, [match, pathname, op.get(state, 'route'), op.get(state, 'active')]);

    // Renderer
    const render = () => {
        const { active, id, label, route } = state;
        return (
            <div ref={containerRef} className={cx()}>
                <div className={cname('row')}>
                    {route ? (
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
                                active,
                            })}>
                            {children}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render
    return permitted ? render() : null;
};

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
import MenuItem from 'components/Admin/registered-components/MenuItem';

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
import MenuItem from 'components/Admin/registered-components/MenuItem';
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
import MenuItem from 'components/Admin/registered-components/MenuItem';

 * @apiExample Dependencies
import { NavLink } from 'react-router-dom';
import { Collapsible, Icon, Prefs } from '@atomic-reactor/reactium-ui';
import Reactium, { useHandle, useSelect, useWindowSize } from 'reactium-core/sdk';
 */
