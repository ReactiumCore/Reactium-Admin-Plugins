import Reactium from 'reactium-core/sdk';
import Settings from './Settings';

const registerPlugin = async () => {
    await Reactium.Plugin.register('s3-adapter');

    Reactium.Zone.addComponent(
        {
            id: 'S3-PLUGIN-SETTINGS-ALL',
            zone: 'plugin-settings-S3Adapter',
            component: Settings,
            order: 0,
        },
        ['s3-adapter.settings-set'],
    );
};

registerPlugin();
