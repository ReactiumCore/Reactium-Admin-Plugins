/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin TypeDelete
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';

(async () => {
    Reactium.Component.register('ContnetTypeDeleteBox', Component);

    Reactium.Zone.addComponent({
        order: 1000,
        component: Component,
        zone: ['admin-content-types'],
        id: 'ADMIN-CONTENT-TYPE-DELETE-BOX',
    });
})();
