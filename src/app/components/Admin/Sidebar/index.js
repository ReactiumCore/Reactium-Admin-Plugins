import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import deps from 'dependencies';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import { Plugins } from 'reactium-core/components/Plugable';
import { Collapsible, Prefs } from '@atomic-reactor/reactium-ui';
import Reactium, { useRegisterHandle, useWindowSize } from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const ENUMS = {
    STATUS: {
        COLLAPSED: 'collapsed',
        COLLAPSING: 'collapsing',
        EXPANDED: 'expanded',
        EXPANDING: 'expanding',
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: AdminSidebar
 * -----------------------------------------------------------------------------
 */
let AdminSidebar = (
    { children, className, direction, namespace, zone, section, ...props },
    ref,
) => {
    // Refs
    const collapsibleRef = useRef();

    const stateRef = useRef({
        ...props,
        status: Prefs.get('admin.sidebar.status', ENUMS.STATUS.EXPANDED),
    });

    const [state, setNewState] = useState(stateRef.current);

    const setState = newState => {
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        setNewState(stateRef.current);
    };

    const onBeforeCollapse = () =>
        setState({ status: ENUMS.STATUS.COLLAPSING });

    const onBeforeExpand = () => setState({ status: ENUMS.STATUS.EXPANDING });

    const onCollapse = () => setState({ status: ENUMS.STATUS.COLLAPSED });

    const onExpand = () => setState({ status: ENUMS.STATUS.EXPANDED });

    const cname = cls => {
        const { status } = stateRef.current;
        return cn({
            [className]: !!className,
            [namespace]: !!namespace,
            [status]: !!status,
            [cls]: !!cls,
        });
    };

    const { width, breakpoint } = useWindowSize({ delay: 0 });

    useEffect(() => {
        const { status } = stateRef.current;
        Prefs.set('admin.sidebar.status', status);
    }, [op.get(stateRef.current, 'status')]);

    // Renderer
    const render = () => {
        const { status } = stateRef.current;
        const maxSize = breakpoint !== 'xs' ? 320 : width;
        const minSize = breakpoint !== 'xs' ? 80 : 1;
        const expanded = status === ENUMS.STATUS.EXPANDED;

        return (
            <Collapsible
                debug={false}
                direction={direction}
                expanded={expanded}
                onBeforeCollapse={onBeforeCollapse}
                onBeforeExpand={onBeforeExpand}
                onCollapse={onCollapse}
                onExpand={onExpand}
                maxSize={maxSize}
                minSize={minSize}
                ref={collapsibleRef}>
                <div className={cname()}>
                    <div className='zone-admin-sidebar-header'>
                        <Plugins zone={[zone, 'header'].join('-')} {...props} />
                    </div>
                    <div className='zone-admin-sidebar-menu'>
                        <Scrollbars
                            style={{
                                width: '100%',
                                height: '100%',
                                overflowX: 'hidden',
                            }}>
                            <nav className={[zone, 'menu-items'].join('-')}>
                                <Plugins
                                    zone={[zone, 'menu'].join('-')}
                                    {...props}
                                />
                            </nav>
                        </Scrollbars>
                    </div>
                    <div className='zone-admin-sidebar-footer'>
                        <Plugins zone={[zone, 'footer'].join('-')} {...props} />
                    </div>
                </div>
            </Collapsible>
        );
    };

    const handle = () => ({
        collapse: () => collapsibleRef.current.collapse(),
        container: collapsibleRef.current,
        ENUMS,
        expand: () => collapsibleRef.current.expand(),
        state: stateRef.current,
        toggle: () => collapsibleRef.current.toggle(),
    });

    useRegisterHandle('AdminSidebar', handle, [
        op.get(stateRef.current, 'status'),
    ]);

    useImperativeHandle(ref, handle);

    // Render
    return render();
};

AdminSidebar = forwardRef(AdminSidebar);

AdminSidebar.ENUMS = ENUMS;

AdminSidebar.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

AdminSidebar.defaultProps = {
    namespace: 'zone-admin-sidebar-container',
    direction: Collapsible.ENUMS.DIRECTION.HORIZONTAL,
};

export { AdminSidebar as default };
