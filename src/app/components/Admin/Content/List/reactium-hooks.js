import ConentList from '.';
import op from 'object-path';
import ENUMS from '../enums';
import domain from './domain';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register(domain.name).then(() => {
    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-LIST',
        component: ConentList,
        order: -1000,
        zone: ['admin-content-list'],
    });
});
