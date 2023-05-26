/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin SidebarWidget
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

(async () => {
    Reactium.Zone.addComponent({
        component: Component,
        zone: ['admin-sidebar-menu'],
        order: 300,
    });
})();
