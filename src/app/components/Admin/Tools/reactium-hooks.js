import Tools from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('AdminTools').then(() => {
    Reactium.Zone.addComponent({
        id: 'ADMIN-TOOLS',
        component: Tools,
        zone: ['admin-tools'],
        order: 1000000000,
    });
});
