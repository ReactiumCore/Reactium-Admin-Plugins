import Reactium from 'reactium-core/sdk';
import BigRed from './BigRed';

const registerResetPlugin = async () => {
    await Reactium.Plugin.register('reset-plugin');

    Reactium.Plugin.addComponent({
        id: 'RESET-PLUGIN-SETTINGS',
        zone: 'plugin-settings-Reset',
        component: BigRed,
        order: 0,
    });
};

registerResetPlugin();
