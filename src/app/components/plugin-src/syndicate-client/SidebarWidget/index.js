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
        <MenuItem
            route={'/admin/plugins/SyndicateClient'}
            label={__('Syndicate Client')}
        />
    );
};

export default SidebarWidget;
