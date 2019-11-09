import React from 'react';
import MenuItem from 'components/Admin/MenuItem';
import { Icon } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarWidget
 * -----------------------------------------------------------------------------
 */
const SidebarWidget = props => (
    <MenuItem
        label='Settings'
        route='/admin/settings'
        icon='Feather.Settings'
    />
);

export default SidebarWidget;
