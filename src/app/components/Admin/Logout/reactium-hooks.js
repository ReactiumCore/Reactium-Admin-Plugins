import Logout from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('AdminLogout').then(() => {
    Reactium.Plugin.addComponent({
        id: 'ADMIN-LOGOUT',
        component: Logout,
        zone: ['logout'],
        order: -1000,
    });
});
