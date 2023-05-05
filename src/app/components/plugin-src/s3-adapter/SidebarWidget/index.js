import React from 'react';
import { __, useHookComponent } from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarWidget
 * -----------------------------------------------------------------------------
 */
const SidebarWidget = props => {
    const MenuItem = useHookComponent('MenuItem');
    return (
        <MenuItem route={'/admin/plugins/S3Adapter'} label={__('S3 Adapter')} />
    );
};

export default SidebarWidget;
