import _ from 'underscore';
import cn from 'classnames';
import { Scrollbars } from 'react-custom-scrollbars';
import React, { forwardRef, useEffect, useRef, useState } from 'react';

import Reactium, {
    useEventHandle,
    useRegisterHandle,
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
let AdminSidebar = ({ namespace, zone, ...props }, ref) => {
    // Refs
    const containerRef = useRef();

    const { breakpoint } = useWindowSize();

    const [status, setStatus] = useState(
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
        setStatus(ENUMS.STATUS.COLLAPSED);
        handle.dispatchEvent(new Event('toggle'));
        handle.dispatchEvent(new Event('collapse'));
    };

    const expand = () => {
        if (isExpanded()) return;
        setStatus(ENUMS.STATUS.EXPANDED);
        handle.dispatchEvent(new Event('toggle'));
        handle.dispatchEvent(new Event('expand'));
    };

    const isCollapsed = () => handle.status === ENUMS.STATUS.COLLAPSED;

    const isExpanded = () => handle.status === ENUMS.STATUS.EXPANDED;

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
        container: containerRef.current,
        cx,
        expand,
        isCollapsed,
        isExpanded,
        setStatus,
        status,
        toggle,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useRegisterHandle('AdminSidebar', () => handle, [handle]);

    useEffect(() => {
        if (!containerRef.current) return;
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
        setHandle(_handle());
    }, [status]);

    useEffect(() => {
        autoCollapse();
    }, [breakpoint]);

    // Renderer
    const render = () => {
        const cname = cn(cx(), status);
        const sname = cn(cx('spacer'), status);

        return (
            <>
                <div className={sname}>.</div>
                <div className={cname} ref={containerRef}>
                    <Scrollbars autoHeight autoHeightMin='100vh'>
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

    // Render
    return render();
};

AdminSidebar = forwardRef(AdminSidebar);

AdminSidebar.ENUMS = ENUMS;

AdminSidebar.defaultProps = {
    namespace: 'admin-sidebar',
};

export { AdminSidebar as default };
