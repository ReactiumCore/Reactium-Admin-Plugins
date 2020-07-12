import Reactium from 'reactium-core/sdk';
import Breadcrumbs from './Breadcrumbs';
import SidebarWidget from './SidebarWidget';
import PluginManager from './index';

const pluginManager = async () => {
    await Reactium.Plugin.register('PluginManager');

    const canViewPluginUI = await Reactium.Capability.check(
        ['plugin-ui.view'],
        false,
    );

    if (canViewPluginUI) {
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
            order: 500,
        });

        Reactium.Zone.addComponent({
            id: 'PLUGIN-MANAGER-BREADCRUMBS',
            zone: ['admin-header'],
            component: Breadcrumbs,
            order: 0,
        });
    }
};
pluginManager();
