import Reset from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('ResetPassword').then(() => {
    Reactium.Plugin.addComponent({
        id: 'RESET-PASSWORD',
        component: Reset,
        zone: ['reset'],
        order: 0,
    });
});
