import React from 'react';
import op from 'object-path';
import { useHandle } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Component: Toggle
 * Hide/Show the Admin Sidebar
 * -----------------------------------------------------------------------------
 */

const Toggle = ({ zones }) => {
    const Sidebar = useHandle('Sidebar');

    const { expanded } = Sidebar;

    const render = () =>
        zones.includes('admin-sidebar') && (
            <button
                className='admin-sidebar-toggle'
                onClick={Sidebar.toggle}
                type='button'>
                <Icon name={expanded ? 'Feather.X' : 'Feather.Menu'} />
            </button>
        );

    return render();
};

export { Toggle as default };
