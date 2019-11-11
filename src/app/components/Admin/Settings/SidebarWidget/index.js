import React from 'react';
import MenuItem from 'components/Admin/MenuItem';
import { Plugins } from 'reactium-core/components/Plugable';
import { __ } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarWidget
 * -----------------------------------------------------------------------------
 */
const SidebarWidget = props => {
    const id = 'admin-sidebar-settings';
    return (
        <MenuItem label={__('Settings')} icon='Linear.Equalizer' id={id}>
            <Plugins zone={id} />
        </MenuItem>
    );
};

export default SidebarWidget;
