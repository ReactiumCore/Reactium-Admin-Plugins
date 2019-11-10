import cn from 'classnames';
import op from 'object-path';
import { Link } from 'react-router-dom';
import { Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useHandle } from 'reactium-core/sdk';

import {
    useAvatar,
    useGreeting,
    useRole,
} from 'components/Admin/Profile/hooks';

import React, {
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarWidget
 * -----------------------------------------------------------------------------
 */
const SidebarWidget = ({ className, namespace, zones = [] }) => {
    if (!zones.includes('admin-sidebar')) {
        return null;
    }

    const Sidebar = useHandle('AdminSidebar');

    const expanded = () =>
        op.get(Sidebar, 'state.status') === Sidebar.ENUMS.STATUS.EXPANDED;

    const avatar = useAvatar();

    const greeting = useGreeting();

    const role = useRole();

    const avatarRef = useRef();

    const intervalRef = useRef();

    const stateRef = useRef({
        width: 50,
        height: 0,
        interval: null,
    });

    const collapseSidebar = () => {
        if (expanded() === true && Reactium.Utils.breakpoint() === 'xs') {
            Sidebar.collapse();
        }
    };

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

    const cname = () =>
        cn({ [className]: !!className, [namespace]: !!namespace });

    const resized = () => {
        let { height } = stateRef.current;

        const elm = avatarRef.current;

        if (!elm) {
            return;
        }

        const width = elm.offsetWidth;

        if (height !== width) {
            height = width;
            op.set(stateRef.current, 'height', height);
            setState({ height });
        }
    };

    useLayoutEffect(() => {
        resized();

        if (!intervalRef.current) {
            intervalRef.current = setInterval(resized, 1);
        }

        return () => clearInterval(intervalRef.current);
    }, [stateRef.current.interval]);

    const render = () => {
        const { height } = stateRef.current;

        return (
            <div className={cname()}>
                <Link
                    to='/admin/profile'
                    className='avatar-image'
                    ref={avatarRef}
                    onClick={() => collapseSidebar()}
                    style={{
                        backgroundImage: `url(${avatar})`,
                        height,
                    }}
                />
                <Link
                    to='/admin/profile'
                    className='avatar-labels'
                    onClick={() => collapseSidebar()}>
                    {greeting && (
                        <span className='avatar-greeting'>{greeting}</span>
                    )}
                    {role && <span className='avatar-role'>{role}</span>}
                </Link>
            </div>
        );
    };

    return render();
};

SidebarWidget.defaultProps = {
    namespace: 'avatar',
};

export default SidebarWidget;
