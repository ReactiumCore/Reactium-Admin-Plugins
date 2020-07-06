import Reactium from 'reactium-core/sdk';
import Settings from './Settings';
import SettingsCheck from './Settings/Check';
import Synchronize from './Settings/Sync';
import SidebarWidget from './SidebarWidget';
import ContentEditorControl from './ContentEditorControl';

const registerPlugin = async () => {
    await Reactium.Plugin.register('syndicate-client');

    const canManagePlugin = await Reactium.Capability.check(
        [
            'Setting.create',
            'Setting.update',
            'setting.SyndicateClient-get',
            'setting.SyndicateClient-set',
        ],
        false,
    );

    if (canManagePlugin) {
        Reactium.Zone.addComponent({
            id: 'SYNDICATE-CLIENT-SETTINGS-ALL',
            zone: ['plugin-settings-SyndicateClient'],
            component: Settings,
            order: 0,
        });

        Reactium.Zone.addComponent({
            id: 'SYNDICATE-CLIENT-SIDEBAR-WIDGET',
            zone: ['admin-sidebar-settings'],
            component: SidebarWidget,
            order: 0,
        });

        Reactium.Zone.addComponent({
            id: 'SYNDICATE-CLIENT-SETTINGS-CHECK',
            zone: ['settings-editor-SyndicateClient'],
            component: SettingsCheck,
            order: 0,
        });

        Reactium.Zone.addComponent({
            id: 'SYNDICATE-CLIENT-SETTINGS-SYNC',
            zone: ['settings-editor-SyndicateClient'],
            component: Synchronize,
            order: Reactium.Enums.priority.lowest,
        });

        Reactium.Zone.addComponent({
            id: '',
            zone: ['admin-content-sidebar'],
            component: ContentEditorControl,
            order: Reactium.Enums.priority.highest,
        });
    }
};

registerPlugin();
