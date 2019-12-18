import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';
import PluginManager from './index';

Reactium.Plugin.register('PluginManager').then(() => {
    Reactium.Zone.addComponent({
        id: 'PLUGIN-MANAGER',
        component: PluginManager,
        zone: ['admin-plugin-manager-content'],
        order: -1000,
    });

    Reactium.Zone.addComponent({
        id: 'PLUGIN-MANAGER-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: 0,
    });
});
