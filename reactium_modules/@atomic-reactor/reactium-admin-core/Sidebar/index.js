import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useState } from 'react';
// import { Scrollbars } from '@atomic-reactor/react-custom-scrollbars';

const Scrollbars = () => null;

import Reactium, {
    useEventHandle,
    useRefs,
    useRegisterHandle,
    useStatus,
    useWindowSize,
    Zone,
} from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        COLLAPSED: 'collapsed',
        EXPANDED: 'expanded',
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: AdminSidebar
 * -----------------------------------------------------------------------------
 */
let AdminSidebar = ({ namespace, zone, ...props }) => {
    // Refs
    const refs = useRefs();

    const { breakpoint } = useWindowSize();

    const [, update] = useState(Date.now());

    const [status, setStatus, isStatus] = useStatus(
        Reactium.Prefs.get('admin.sidebar.status', ENUMS.STATUS.EXPANDED),
    );

    const autoCollapse = () => {
        const breaks = ['xs', 'sm'];
        if (breaks.includes(breakpoint)) {
            collapse();
        }
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const collapse = () => {
        if (isCollapsed()) return;
        handle.dispatchEvent(new Event('toggle'));
        handle.dispatchEvent(new Event('collapse'));
        setStatus(ENUMS.STATUS.COLLAPSED, true);
    };

    const expand = () => {
        if (isExpanded()) return;
        handle.dispatchEvent(new Event('toggle'));
        handle.dispatchEvent(new Event('expand'));
        setStatus(ENUMS.STATUS.EXPANDED, true);
    };

    const isCollapsed = () => isStatus(ENUMS.STATUS.COLLAPSED);

    const isExpanded = () => isStatus(ENUMS.STATUS.EXPANDED);

    const onHotkey = e => {
        if (Reactium.Utils.Fullscreen.isExpanded()) return;
        e.preventDefault();
        toggle();
    };

    const toggle = () => {
        if (isExpanded()) {
            collapse();
        } else {
            expand();
        }
    };

    const _handle = () => ({
        ENUMS,
        collapse,
        container: refs.get('sidebar.container'),
        cx,
        expand,
        isCollapsed,
        isExpanded,
        setStatus,
        status,
        toggle,
        render: () => update(Date.now()),
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useRegisterHandle('AdminSidebar', () => handle, [handle]);

    useEffect(() => {
        if (!refs.get('sidebar.container')) return;
        Reactium.Hotkeys.register('sidebar-toggle', {
            callback: onHotkey,
            key: 'mod+]',
            order: Reactium.Enums.priority.lowest,
            scope: document,
        });

        return () => {
            Reactium.Hotkeys.unregister('sidebar-toggle');
        };
    }, []);

    useEffect(() => {
        Reactium.Prefs.set('admin.sidebar.status', status);
        Object.entries(_handle()).forEach(([key, value]) =>
            op.set(handle, key, value),
        );
        setHandle(handle);
    }, [status]);

    useEffect(() => {
        autoCollapse();
    }, [breakpoint]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const body = _.first(document.getElementsByTagName('BODY'));

        if (isCollapsed()) {
            body.classList.add(cx('collapsed'));
            body.classList.remove(cx('expanded'));
        } else {
            body.classList.add(cx('expanded'));
            body.classList.remove(cx('collapsed'));
        }
    });

    // Renderer
    return (
        <>
            <div className={cn(cx('spacer'), status)}>.</div>
            <div
                className={cn(cx(), status)}
                ref={elm => refs.set('sidebar.container', elm)}>
                <Scrollbars>
                    <div className={cx('container')}>
                        <div className={cx('header')}>
                            <Zone
                                zone={[zone, 'header'].join('-')}
                                {...props}
                            />
                        </div>
                        <div className={cx('menu')}>
                            <nav className={[zone, 'menu-items'].join('-')}>
                                <Zone
                                    zone={[zone, 'menu'].join('-')}
                                    {...props}
                                />
                            </nav>
                        </div>
                        <div className={cx('footer')}>
                            <Zone
                                zone={[zone, 'footer'].join('-')}
                                {...props}
                            />
                        </div>
                    </div>
                </Scrollbars>
            </div>
        </>
    );
};

AdminSidebar.ENUMS = ENUMS;

AdminSidebar.defaultProps = {
    namespace: 'admin-sidebar',
};

export { AdminSidebar as default };
