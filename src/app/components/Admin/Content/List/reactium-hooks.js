import op from 'object-path';
import ENUMS from '../enums';
import domain from './domain';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './Widget/SidebarWidget';

Reactium.Plugin.register(domain.name).then(() => {
    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-SIDEBAR-WIDGET',
        component: SidebarWidget,
        order: 200,
        zone: ['admin-sidebar-menu'],
    });
});
