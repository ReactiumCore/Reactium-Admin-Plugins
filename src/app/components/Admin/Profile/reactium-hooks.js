import Profile from './index';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

Reactium.Plugin.register('AdminProfile').then(() => {
    Reactium.Plugin.addComponent({
        id: 'ADMIN-PROFILE',
        component: Profile,
        zone: ['admin-profile'],
        order: -1000,
    });

    Reactium.Plugin.addComponent({
        id: 'ADMIN-PROFILE-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: -100000,
    });
});
