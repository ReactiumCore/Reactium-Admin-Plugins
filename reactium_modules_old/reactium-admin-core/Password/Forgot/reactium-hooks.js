import Forgot from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('ForgotPassword').then(() => {
    Reactium.Zone.addComponent({
        id: 'FORGOT-PLUGIN',
        component: Forgot,
        zone: ['forgot'],
        order: 1000,
    });
});
