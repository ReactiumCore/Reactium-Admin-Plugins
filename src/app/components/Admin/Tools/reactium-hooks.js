import Tools from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('AdminTools').then(() => {
    Reactium.Plugin.addComponent({
        id: 'ADMIN-TOOLS',
        component: Tools,
        zone: ['admin-header'],
        order: 1000000000,
    });
});
