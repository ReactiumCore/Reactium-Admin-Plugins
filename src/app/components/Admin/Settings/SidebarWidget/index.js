import React from 'react';
import { __ } from 'reactium-core/sdk';
import MenuItem from 'components/Admin/MenuItem';
import { Plugins } from 'reactium-core/components/Plugable';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarWidget
 * -----------------------------------------------------------------------------
 */
const SidebarWidget = props => {
    const id = 'admin-sidebar-settings';
    return (
        <MenuItem label={__('Settings')} icon='Linear.Equalizer' id={id}>
            <div>
                <Plugins zone={id} />
            </div>
        </MenuItem>
    );
};

export default SidebarWidget;
