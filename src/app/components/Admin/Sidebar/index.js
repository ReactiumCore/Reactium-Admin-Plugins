import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import deps from 'dependencies';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import { Collapsible, Prefs } from '@atomic-reactor/reactium-ui';
import Reactium, {
    useRegisterHandle,
    useDocument,
    useWindowSize,
    Zone,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
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

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Hook Component: AdminSidebar
 * -----------------------------------------------------------------------------
 */
let AdminSidebar = (
    { children, className, direction, namespace, zone, section, ...props },
    ref,
) => {
    const iDoc = useDocument();

    // Refs
    const collapsibleRef = useRef();
    const containerRef = useRef();

    const stateRef = useRef({
        ...props,
        ival: null,
        status: Prefs.get('admin.sidebar.status', ENUMS.STATUS.EXPANDED),
    });

    const [updated, update] = useState();
    const [state, setNewState] = useState(stateRef.current);
    const [maxSize, setMaxSize] = useState(320);
    const [minSize, setMinSize] = useState(80);

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

    const isDesktop = () => !['xs'].includes(breakpoint);

    const isMobile = () => ['xs', 'sm'].includes(breakpoint);

    const isExpanded = () => {
        const { status } = stateRef.current;
        return status === ENUMS.STATUS.EXPANDED;
    };

    const resizePlaceholder = () => {
        const { ival } = stateRef.current;
        const container = containerRef.current;
        const { container: collapsible } = collapsibleRef.current || {};

        if (!collapsible || !container) {
            if (ival) {
                clearInterval(ival);
                setState({ ival: null });
            }
            return;
        }

        if (container.offsetWidth !== collapsible.offsetWidth) {
            container.style.width = `${collapsible.offsetWidth}px`;
        }
    };

    const Placeholder = () => {
        const { status } = stateRef.current;
        const target = iDoc.querySelector('.section-sidebar');

        if (!target) {
            return;
        }

        return ReactDOM.createPortal(
            <div className='sidebar-placeholder' ref={containerRef} />,
            target,
        );
    };

    const handle = () => ({
        collapse: () => collapsibleRef.current.collapse(),
        container: collapsibleRef.current,
        ENUMS,
        expand: () => collapsibleRef.current.expand(),
        state: stateRef.current,
        toggle: () => collapsibleRef.current.toggle(),
        update,
    });

    useRegisterHandle('AdminSidebar', handle, [
        op.get(stateRef.current, 'status'),
        updated,
    ]);

    useImperativeHandle(ref, handle);

    useEffect(() => {
        setState({ updated });
    }, [updated]);

    useEffect(() => {
        const { status } = stateRef.current;
        Prefs.set('admin.sidebar.status', status);
    }, [op.get(stateRef.current, 'status')]);

    useEffect(() => {
        if (isMobile()) {
            collapsibleRef.current.collapse().then(() => {
                setState({ status: ENUMS.STATUS.COLLAPSED });
            });
        }
    }, [width]);

    useEffect(() => {
        setMaxSize(isDesktop() ? 320 : width);
        setMinSize(isMobile() ? 1 : 80);
    }, [breakpoint]);

    useLayoutEffect(() => {
        const { ival } = stateRef.current;
        if (!ival) {
            resizePlaceholder();
            setState({ ival: setInterval(resizePlaceholder, 1) });
        }

        return () => {
            clearInterval(ival);
        };
    }, [op.get(stateRef.current, 'ival')]);

    // Renderer
    const render = () => {
        const { status } = stateRef.current;

        return (
            <Collapsible
                debug={false}
                direction={direction}
                expanded={isExpanded()}
                onBeforeCollapse={onBeforeCollapse}
                onBeforeExpand={onBeforeExpand}
                onCollapse={onCollapse}
                onExpand={onExpand}
                maxSize={maxSize}
                minSize={minSize}
                ref={collapsibleRef}>
                {Placeholder()}
                <Scrollbars autoHeight autoHeightMin='100vh'>
                    <div className={cname()}>
                        <div className='zone-admin-sidebar-header'>
                            <Zone
                                zone={[zone, 'header'].join('-')}
                                {...props}
                            />
                        </div>
                        <div className='zone-admin-sidebar-menu'>
                            <nav className={[zone, 'menu-items'].join('-')}>
                                <Zone
                                    updated={updated}
                                    zone={[zone, 'menu'].join('-')}
                                    {...props}
                                />
                            </nav>
                        </div>
                        <div className='zone-admin-sidebar-footer'>
                            <Zone
                                zone={[zone, 'footer'].join('-')}
                                {...props}
                            />
                        </div>
                    </div>
                </Scrollbars>
            </Collapsible>
        );
    };

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
