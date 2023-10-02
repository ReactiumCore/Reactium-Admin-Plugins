import { Breadcrumbs } from './Breadcrumbs';
import Reactium from '@atomic-reactor/reactium-core/sdk';

(async () => {
    Reactium.Zone.addComponent({
        component: Breadcrumbs,
        zone: ['admin-header'],
        order: Reactium.Enums.priority.lowest,
        id: 'ADMIN-CONTENT-BREADCRUMBS-WIDGET',
    });
})();
