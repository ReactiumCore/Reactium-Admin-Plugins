import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

const PLUGIN = 'admin-settings';

const settingsPlugin = async () => {
    await Reactium.Plugin.register(PLUGIN);

    await Reactium.Zone.addComponent({
        id: `${PLUGIN}-admin-sidebar-menu`,
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: 600,
    });
};

settingsPlugin();
