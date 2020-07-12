import Reactium from 'reactium-core/sdk';
import Breadcrumbs from './Breadcrumbs';
import SidebarWidget from './SidebarWidget';

const PLUGIN = 'admin-settings';

const settingsPlugin = async () => {
    await Reactium.Plugin.register(PLUGIN);

    const canView = await Reactium.Capability.check(
        ['Capability.create', 'Capability.update'],
        false,
    );

    if (canView) {
        Reactium.Zone.addComponent({
            id: `${PLUGIN}-admin-sidebar-menu`,
            component: SidebarWidget,
            zone: ['admin-sidebar-menu'],
            order: 600,
        });

        Reactium.Zone.addComponent({
            id: `${PLUGIN}-breadcrumbs`,
            zone: ['admin-header'],
            component: Breadcrumbs,
            order: 0,
        });
    }
};

settingsPlugin();
