import Sidebar from './index';
import Toggle from './MenuToggle';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('AdminSidebar').then(() => {
    Reactium.Zone.addComponent({
        id: 'ADMIN-SIDEBAR',
        component: Sidebar,
        zone: ['admin-sidebar'],
        order: -1000,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-SIDEBAR-MENU-TOGGLE',
        component: Toggle,
        zone: ['admin-sidebar'],
        order: 1000000,
    });
});
