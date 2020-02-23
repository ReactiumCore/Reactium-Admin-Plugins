import SidebarWidget from '.';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('content-sidebar-widget').then(() => {
    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-SIDEBAR-WIDGET',
        component: SidebarWidget,
        order: 200,
        zone: ['admin-sidebar-menu'],
    });
});
