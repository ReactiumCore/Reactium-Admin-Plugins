import Reactium from 'reactium-core/sdk';
import Settings from './Settings';
import SidebarWidget from './SidebarWidget';
import SDK from './sdk';

const registerPlugin = async () => {
    await Reactium.Plugin.register('syndicate');

    const canManagePlugin = await Reactium.Capability.check(
        ['Setting.create', 'Setting.update', 'Setting.retrieve'],
        false,
    );

    Reactium.Syndicate = SDK;

    if (canManagePlugin) {
        Reactium.Zone.addComponent({
            id: 'SYNDICATE-PLUGIN-SETTINGS-ALL',
            zone: 'plugin-settings-Syndicate',
            component: Settings,
            order: 0,
        });

        Reactium.Zone.addComponent({
            id: 'SYNDICATE-PLUGIN-SIDEBAR-WIDGET',
            zone: 'admin-sidebar-settings',
            component: SidebarWidget,
            order: 0,
        });
    }
};

registerPlugin();
