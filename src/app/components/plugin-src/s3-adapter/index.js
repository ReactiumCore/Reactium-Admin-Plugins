import Reactium from 'reactium-core/sdk';
import Settings from './Settings';
import SidebarWidget from './SidebarWidget';

const registerPlugin = async () => {
    await Reactium.Plugin.register('S3Adapter');

    const canManagePlugin = await Reactium.Capability.check(
        [
            'setting.create',
            'setting.update',
            'setting.s3adapter-set',
            'setting.retrieve',
            'setting.s3adapter-get',
        ],
        false,
    );

    if (canManagePlugin) {
        Reactium.Zone.addComponent({
            id: 'S3-PLUGIN-SETTINGS-ALL',
            zone: 'plugin-settings-S3Adapter',
            component: Settings,
            order: 0,
        });

        Reactium.Zone.addComponent({
            id: 'S3-PLUGIN-SIDEBAR-WIDGET',
            zone: 'admin-sidebar-settings',
            component: SidebarWidget,
            order: 0,
        });
    }
};

registerPlugin();
