import React from 'react';
import MenuItem from 'components/Admin/MenuItem';
import { Icon } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: SidebarWidget
 * -----------------------------------------------------------------------------
 */
const SidebarWidget = props => (
    <>
        <MenuItem label='Dashboard' route='/admin' icon='Feather.Monitor' />

        <MenuItem label='Test' icon='Feather.User' active={true} id={'test'}>
            CHILDREN
        </MenuItem>
    </>
);

export default SidebarWidget;
