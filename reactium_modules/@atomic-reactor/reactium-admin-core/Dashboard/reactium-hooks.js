import SDK from './sdk';
import Dashboard from './index';
import Breadcrumbs from './Breadcrumbs';
import Reactium from '@atomic-reactor/reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

const AdminDashboardPlugin = async () => {
    await Reactium.Plugin.register(
        'AdminDashboard',
        Reactium.Enums.priority.highest,
    );

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD',
        component: Dashboard,
        zone: ['admin-dashboard'],
        order: Reactium.Enums.priority.highest,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: 100,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD-BREADCRUMBS-WIDGET',
        component: Breadcrumbs,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-header'],
    });

    Reactium.Dashboard = SDK;
};

AdminDashboardPlugin();
