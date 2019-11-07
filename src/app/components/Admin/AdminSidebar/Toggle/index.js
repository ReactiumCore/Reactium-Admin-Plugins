import React from 'react';
import op from 'object-path';
import { Icon } from '@atomic-reactor/reactium-ui';
import { useSelect } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Toggle
 * -----------------------------------------------------------------------------
 */
const Toggle = props => {
    const expanded = useSelect(state =>
        op.get(state, 'AdminSidebar.expanded', true),
    );

    return (
        <button
            type='button'
            className='admin-sidebar-toggle'
            onClick={() => window.Sidebar.toggle()}>
            <Icon name={expanded ? 'Feather.X' : 'Feather.Menu'} />
        </button>
    );
};

export { Toggle as default };
