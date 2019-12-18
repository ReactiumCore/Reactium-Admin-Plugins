import Logo from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('AdminLogo').then(() => {
    Reactium.Zone.addComponent({
        id: 'ADMIN-LOGO-PLUGIN',
        component: Logo,
        zone: ['admin-header'],
        order: Reactium.Enums.priority.highest * 10,
    });
});
