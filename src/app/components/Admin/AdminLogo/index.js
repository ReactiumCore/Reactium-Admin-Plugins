import React from 'react';
import Logo from 'components/common-ui/Logo';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

Reactium.Component.register(
    'component-admin-logo',
    Logo,
    Reactium.Enums.priority.highest,
);

/**
 * -----------------------------------------------------------------------------
 * Functional Component: AdminLogo
 * -----------------------------------------------------------------------------
 */
const AdminLogo = props => {
    const Logo = useHookComponent('component-admin-logo');

    return (
        <span className='admin-logo'>
            <Logo />
        </span>
    );
};

export default AdminLogo;
