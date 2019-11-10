import Dashboard from './index';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

Reactium.Plugin.register('AdminDashboard').then(() => {
    Reactium.Plugin.addComponent({
        id: 'ADMIN-DASHBOARD',
        component: Dashboard,
        zone: ['admin-content'],
        order: -1000,
    });

    Reactium.Plugin.addComponent({
        id: 'ADMIN-DASHBOARD-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: 0,
    });
});
