import Logo from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('AdminLogo').then(() => {
    Reactium.Plugin.addComponent({
        id: 'ADMIN-LOGO-PLUGIN',
        component: Logo,
        zone: ['admin-header'],
        order: -1000,
    });
});
