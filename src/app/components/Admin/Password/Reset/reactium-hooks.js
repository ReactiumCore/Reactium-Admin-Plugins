import Reset from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('ResetPassword').then(() => {
    Reactium.Zone.addComponent({
        id: 'RESET-PASSWORD',
        component: Reset,
        zone: ['reset'],
        order: 0,
    });
});
