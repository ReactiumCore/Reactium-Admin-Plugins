import Reactium from 'reactium-core/sdk';
import Settings from './Settings';
import SidebarWidget from './SidebarWidget';

const registerPlugin = async () => {
    await Reactium.Plugin.register('syndicate-client');

    const canManagePlugin = await Reactium.Capability.check(
        [
            'Setting.create',
            'Setting.update',
            'setting.SyndicationClient-get',
            'setting.SyndicationClient-set',
        ],
        false,
    );

    if (canManagePlugin) {
        Reactium.Zone.addComponent({
            id: 'SYNDICATE-CLIENT-SETTINGS-ALL',
            zone: 'plugin-settings-SyndicateClient',
            component: Settings,
            order: 0,
        });

        Reactium.Zone.addComponent({
            id: 'SYNDICATE-CLIENT-SIDEBAR-WIDGET',
            zone: 'admin-sidebar-settings',
            component: SidebarWidget,
            order: 0,
        });
    }
};

registerPlugin();
