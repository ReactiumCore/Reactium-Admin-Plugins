import React from 'react';
import { __, Zone } from 'reactium-core/sdk';
import MenuItem from 'components/Admin/registered-components/MenuItem';

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
                <Zone zone={id} />
            </div>
        </MenuItem>
    );
};

export default SidebarWidget;
