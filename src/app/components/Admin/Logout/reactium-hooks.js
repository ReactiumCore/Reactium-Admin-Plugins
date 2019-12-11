import Logout from './index';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

Reactium.Plugin.register('AdminLogout').then(() => {
    Reactium.Plugin.addComponent({
        id: 'ADMIN-LOGOUT',
        component: Logout,
        zone: ['logout'],
        order: -1000,
    });

    Reactium.Plugin.addComponent({
        id: 'ADMIN-LOGOUT-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: 1000,
    });
});
