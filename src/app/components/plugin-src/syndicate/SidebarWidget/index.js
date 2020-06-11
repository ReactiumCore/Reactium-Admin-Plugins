import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarWidget
 * -----------------------------------------------------------------------------
 */
const SidebarWidget = props => {
    const MenuItem = useHookComponent('MenuItem');
    return (
        <MenuItem route={'/admin/plugins/Syndicate'} label={__('Syndicate')} />
    );
};

export default SidebarWidget;
