import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarToggle
 * -----------------------------------------------------------------------------
 */
const SidebarToggle = props => {
    return (
        <>
            <button
                type='button'
                onClick={() => {
                    console.log(window.Sidebar);
                    window.Sidebar.toggle();
                }}>
                SidebarToggle
            </button>
            <Link to='/admin' className='mx-xs-12'>
                Admin
            </Link>
            <Link to='/'>Home</Link>
        </>
    );
};

export default SidebarToggle;
