import React from 'react';
import op from 'object-path';
import { useHandle, useSelect } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Component: Toggle
 * Hide/Show the Admin Sidebar
 * -----------------------------------------------------------------------------
 */

const Toggle = ({ zones }) => {
    const expanded = useSelect(state =>
        op.get(state, 'AdminSidebar.expanded', true),
    );

    const Sidebar = useHandle('Sidebar');

    const render = () =>
        zones.includes('admin-sidebar') && (
            <button
                className='admin-sidebar-toggle'
                onClick={() => Sidebar.toggle()}
                type='button'>
                <Icon
                    name={expanded ? 'Feather.MoreVertical' : 'Feather.Menu'}
                />
            </button>
        );

    return render();
};

export { Toggle as default };
