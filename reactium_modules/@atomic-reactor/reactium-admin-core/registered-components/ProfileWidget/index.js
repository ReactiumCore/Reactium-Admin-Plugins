import cn from 'classnames';
import React, { useEffect, useRef } from 'react';
import { useProfileGreeting, useProfileRole } from './hooks';
import Reactium, { useDerivedState } from 'reactium-core/sdk';
import useAvatar from 'reactium-admin-core/User/useAvatar';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarWidget
 * -----------------------------------------------------------------------------
 */
const SidebarWidget = ({ className, namespace, zones = [] }) => {
    if (!zones.includes('admin-sidebar')) {
        return null;
    }

    // Refs
    const avatarRef = useRef();
    const containerRef = useRef();

    // Hooks
    const [getAvatar] = useAvatar(Reactium.User.current());
    const greeting = useProfileGreeting();
    const role = useProfileRole(Reactium.User.current());

    // State
    const [state, setNewState] = useDerivedState({ avatar: getAvatar });
    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    // Functions
    const cname = () =>
        cn({ [className]: !!className, [namespace]: !!namespace });

    const nav = () =>
        Reactium.Routing.history.push(
            `/admin/user/${Reactium.User.current().objectId}/content`,
        );

    const unMounted = () => !containerRef.current;

    const _onStatus = e => {
        if (unMounted()) return;

        const { event, value = {} } = e;

        if (event !== 'SAVED') return;
        if (!Reactium.User.isCurrent(value)) return;

        const { avatar } = value;
        if (avatar && avatar !== state.avatar) setState({ avatar });
    };

    useEffect(() => {
        const { avatar } = state;
        if (avatar !== getAvatar) {
            setState({ avatar: getAvatar });
        }
    }, [getAvatar]);

    useEffect(() => {
        const hook = Reactium.Hook.register('USER-STATUS', e => _onStatus(e));
        return () => {
            Reactium.Hook.unregister(hook);
        };
    });

    const render = () => {
        const { avatar } = state;

        return (
            <div className={cname()} ref={containerRef}>
                <button
                    className='avatar-image'
                    ref={avatarRef}
                    onClick={nav}
                    style={{
                        backgroundImage: `url(${avatar})`,
                    }}
                />
                <button className='avatar-labels' onClick={nav}>
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
