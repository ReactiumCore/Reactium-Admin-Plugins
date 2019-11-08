import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import { useHandle } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { useWindowSize } from '@atomic-reactor/reactium-ui/hooks';

/**
 * -----------------------------------------------------------------------------
 * Component: Toggle
 * Hide/Show the Admin Sidebar
 * -----------------------------------------------------------------------------
 */

const Toggle = ({ zones = [] }) => {
    if (!zones.includes('admin-sidebar')) {
        return null;
    }

    const Sidebar = useHandle('AdminSidebar');

    const { expanded } = op.get(Sidebar, 'state', true);

    const cname = () => cn({ 'admin-sidebar-toggle': true, expanded });

    const { width } = useWindowSize();

    const icon =
        width > 640
            ? expanded
                ? 'Feather.MoreVertical'
                : 'Feather.Menu'
            : expanded
            ? 'Feather.X'
            : 'Feather.Menu';

    const render = () => (
        <button
            className={cname()}
            onClick={() => Sidebar.toggle()}
            type='button'>
            <Icon name={icon} />
        </button>
    );

    return render();
};

export { Toggle as default };
