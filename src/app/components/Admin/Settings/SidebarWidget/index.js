import React from 'react';
import op from 'object-path';
import { __, useHookComponent, Zone } from 'reactium-core/sdk';

const isActive = (match = {}, location) =>
    String(op.get(location, 'pathname', '/'))
        .replace(/\\/gi, '')
        .toLowerCase()
        .startsWith('/admin/settings');

const SidebarWidget = props => {
    const MenuItem = useHookComponent('MenuItem');
    const id = 'admin-sidebar-settings';
    return (
        <MenuItem
            route='/admin/settings'
            label={__('Settings')}
            icon='Linear.Equalizer'
            id={id}
            isActive={isActive}>
            <Zone zone={id} />
        </MenuItem>
    );
};

export default SidebarWidget;
