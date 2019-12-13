import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Collapsible, Icon, Prefs } from '@atomic-reactor/reactium-ui';
import React, { useEffect, useRef, useState } from 'react';

import Reactium, {
    useHandle,
    useSelect,
    useWindowSize,
} from 'reactium-core/sdk';

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
let MenuItem = ({ isActive, capabilities = [], children, ...props }) => {
    const match = useSelect(state => op.get(state, 'Router.match'), {});
    const pathname = useSelect(state => op.get(state, 'Router.pathname', '/'));

    const Sidebar = useHandle('AdminSidebar');

    const Tools = useHandle('AdminTools');

    const { width, breakpoint } = useWindowSize({ delay: 0 });

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

    const hideTooltip = e => {
        if (e) {
            const hasTooltip = !!e.target.getAttribute('data-tooltip');
            if (hasTooltip) {
                Tools.Tooltip.hide(e);
            }
        }
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

    const expanded = () =>
        op.get(Sidebar, 'state.status') === Sidebar.ENUMS.STATUS.EXPANDED;

    const toggle = () => {
        if (!collapsibleRef.current) {
            return;
        }

        const { active } = stateRef.current;

        if (!expanded() && collapsibleRef.current) {
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

    const collapseSidebar = e => {
        hideTooltip(e);

        if (expanded() && ['xs', 'sm'].includes(breakpoint)) {
            Sidebar.collapse();
        }
    };

    const Label = () => {
        let { countNumber, icon, label, title } = stateRef.current;

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

    const Link = () => {
        const { exact, route } = stateRef.current;
        return (
            <NavLink
                onClick={collapseSidebar}
                exact={exact}
                className={cname('link')}
                to={route}
                isActive={isActive}>
                <Label />
            </NavLink>
        );
    };

    const Heading = () => {
        const { onClick = toggle, active } = stateRef.current;
        const classname = cn({ [cname('link')]: true, active });

        return (
            <button
                className={classname}
                onClick={e => {
                    hideTooltip(e);
                    onClick(e);
                }}>
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
        const { label, route } = stateRef.current;

        return (
            <div ref={containerRef} className={cx()}>
                <div className={cname('row')}>
                    {route ? <Link /> : <Heading />}
                    {children && Content()}
                </div>
            </div>
        );
    };

    const [permitted, setPermitted] = useState(false);
    useEffect(() => {
        if (!capabilities || capabilities.length < 1) {
            setPermitted(true);
            return;
        }

        Reactium.User.can(capabilities, false).then(allowed => {
            if (permitted !== allowed) {
                setPermitted(allowed);
            }
        });
    }, []);

    // Side Effects
    useEffect(() => setState(props), Object.values(props));

    useEffect(() => {
        const { count } = stateRef.current;

        const countNumber = Reactium.Utils.abbreviatedNumber(count);
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

    // Render
    return permitted ? render() : null;
};

MenuItem.propTypes = {
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
 * @api {Component} <MenuItem/> MenuItem
 * @apiDescription Component used for Sidebar elements.
 * @apiName MenuItem
 * @apiGroup Components
 * @apiParam {Mixed} label The `{String}` or `PropTypes.node` to display.
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
 * @apiParam {String} [title] Tooltip to dislay for the MenuItem. If empty the `label` value is used.
 * @apiExample Simple Usage:
import React from 'react';
import MenuItem from 'components/Admin/registered-components/MenuItem';

const SidebarWidget = () => (
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

 * @apiExample Plugin Zone:
import MenuItem from 'components/Admin/registered-components/MenuItem';
import { Plugins } from 'reactium-core/components/Plugable';

const SidebarWidget = () => (
  <MenuItem
    icon='Linear.Equalizer'
    id='admin-sidebar-settings'
    label='Settings' >
    <Plugins zone='admin-sidebar-settings' />
  </MenuItem>
);

 * @apiExample Import
import MenuItem from 'components/Admin/registered-components/MenuItem';

 * @apiExample Dependencies
import { NavLink } from 'react-router-dom';
import { Collapsible, Icon, Prefs } from '@atomic-reactor/reactium-ui';
import Reactium, { useHandle, useSelect, useWindowSize } from 'reactium-core/sdk';
 */
