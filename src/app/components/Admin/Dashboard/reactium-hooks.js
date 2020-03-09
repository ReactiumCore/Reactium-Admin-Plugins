import Dashboard from './index';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

const AdminDashboardPlugin = async () => {
    await Reactium.Plugin.register(
        'AdminDashboard',
        Reactium.Enums.priority.highest,
    );

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD',
        component: Dashboard,
        zone: ['admin-content'],
        order: -1000,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: 100,
    });
};

AdminDashboardPlugin();
