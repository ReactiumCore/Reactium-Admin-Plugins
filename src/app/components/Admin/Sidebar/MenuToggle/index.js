import React from 'react';
import cn from 'classnames';
import op from 'object-path';
import { Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useHandle, useWindowSize } from 'reactium-core/sdk';

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

    const expanded = () =>
        op.get(Sidebar, 'state.status') === Sidebar.ENUMS.STATUS.EXPANDED;

    const cname = () =>
        cn({ 'admin-sidebar-toggle': true, expanded: expanded() });

    const { width, breakpoint } = useWindowSize({ delay: 0 });

    const icon = () =>
        !['xs', 'sm'].includes(breakpoint)
            ? expanded()
                ? 'Feather.MoreVertical'
                : 'Feather.Menu'
            : expanded()
            ? 'Feather.X'
            : 'Feather.Menu';

    const tip = () => (expanded() ? 'collapse menu' : 'expand menu');

    const render = () => {
        return (
            <button
                className={cname()}
                onClick={() => Sidebar.toggle()}
                type='button'
                title={tip()}
                data-tooltip={tip()}
                data-align='right'
                data-vertical-align='middle'>
                <div className='button'>
                    <Icon name={icon()} />
                </div>
            </button>
        );
    };

    return render();
};

export { Toggle as default };
