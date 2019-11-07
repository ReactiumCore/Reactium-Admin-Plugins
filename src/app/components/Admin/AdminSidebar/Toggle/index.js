import React from 'react';
import op from 'object-path';
import { Icon } from '@atomic-reactor/reactium-ui';
import { useSelect } from 'reactium-core/sdk';

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

    const render = () =>
        zones.includes('admin-sidebar') && (
            <button
                type='button'
                className='admin-sidebar-toggle'
                onClick={() => window.Sidebar.toggle()}>
                <Icon name={expanded ? 'Feather.X' : 'Feather.Menu'} />
            </button>
        );

    return render();
};

export { Toggle as default };
