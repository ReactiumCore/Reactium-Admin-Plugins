/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin TypeDelete
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

(async () => {
    Reactium.Component.register('ContnetTypeDeleteBox', Component);

    Reactium.Zone.addComponent({
        order: 1000,
        component: Component,
        zone: ['admin-content-types', 'admin-content-type-editor'],
        id: 'ADMIN-CONTENT-TYPE-DELETE-BOX',
    });
})();
