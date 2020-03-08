import cn from 'classnames';
import op from 'object-path';
import { Link } from 'react-router-dom';
import { Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useHandle, useWindowSize } from 'reactium-core/sdk';

import {
    useProfileAvatar,
    useProfileGreeting,
    useProfileRole,
} from 'components/Admin/Profile/hooks';

import React, {
    useEffect,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const noop = () => {
    return true;
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarWidget
 * -----------------------------------------------------------------------------
 */
const SidebarWidget = ({ className, namespace, zones = [] }) => {
    if (!zones.includes('admin-sidebar')) {
        return null;
    }

    const Profile = useHandle('ProfileEditor');

    const role = useProfileRole(Reactium.User.current());

    const getAvatar = useProfileAvatar(Reactium.User.current());

    const greeting = useProfileGreeting();

    const { breakpoint } = useWindowSize();

    const avatarRef = useRef();

    const containerRef = useRef();

    const intervalRef = useRef();

    const stateRef = useRef({
        avatar: getAvatar,
    });

    const toggle = () => Profile.toggle();

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

    useEffect(() => {
        const { avatar } = stateRef.current;
        if (avatar !== getAvatar) {
            setState({ avatar: getAvatar });
        }
    }, [getAvatar]);

    const render = () => {
        const { avatar } = stateRef.current;

        return (
            <div className={cname()} ref={containerRef}>
                <button
                    className='avatar-image'
                    ref={avatarRef}
                    onClick={() => toggle()}
                    style={{
                        backgroundImage: `url(${avatar})`,
                    }}
                />
                <button className='avatar-labels' onClick={() => toggle()}>
                    {greeting && (
                        <span className='avatar-greeting'>{greeting}</span>
                    )}
                    {role && <span className='avatar-role'>{role}</span>}
                </button>
            </div>
        );
    };

    return render();
};

SidebarWidget.defaultProps = {
    namespace: 'avatar',
};

export default SidebarWidget;
