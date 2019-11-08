import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import deps from 'dependencies';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import { Collapsible } from '@atomic-reactor/reactium-ui';
import { Plugins } from 'reactium-core/components/Plugable';
import { useWindowSize } from '@atomic-reactor/reactium-ui/hooks';
import { useRegisterHandle, useSelect, useStore } from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect as useWindowEffect,
    useRef,
} from 'react';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const ENUMS = {};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: AdminSidebar
 * -----------------------------------------------------------------------------
 */
let AdminSidebar = (
    { children, className, direction, namespace, zone, section, ...props },
    ref,
) => {
    const { dispatch } = useStore();
    const actions = deps().actions.AdminSidebar;

    const expanded = useSelect(state =>
        op.get(state, 'AdminSidebar.expanded', true),
    );

    // Refs
    const collapsibleRef = useRef();

    const cname = () =>
        cn({ [className]: !!className, [namespace]: !!namespace });

    const onCollapse = () => dispatch(actions.status(false));

    const onExpand = () => dispatch(actions.status(true));

    const { width } = useWindowSize();

    const maxSize = width > 640 ? 320 : width;
    const minSize = width > 640 ? 80 : 1;

    // Renderer
    const render = () => (
        <Collapsible
            direction={direction}
            expanded={expanded}
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
                        <Plugins zone={[zone, 'menu'].join('-')} {...props} />
                    </Scrollbars>
                </div>
            </div>
        </Collapsible>
    );

    const handle = () => ({
        collapse: () => collapsibleRef.current.collapse(),
        container: collapsibleRef.current,
        expand: () => collapsibleRef.current.expand(),
        state: { expanded },
        toggle: () => collapsibleRef.current.toggle(),
    });

    useRegisterHandle('AdminSidebar', handle, [expanded]);

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
