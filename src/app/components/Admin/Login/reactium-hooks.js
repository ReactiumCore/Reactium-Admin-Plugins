import Login from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('AdminLogin').then(() => {
    Reactium.Plugin.addComponent({
        id: 'ADMIN-LOGIN',
        component: Login,
        zone: ['login'],
        order: -1000,
    });
});
