/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin TypeList
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';
import { useContentTypes } from './useContentTypes';

(async () => {
    Reactium.Zone.addComponent({
        order: -1000,
        component: Component,
        zone: ['admin-content-types'],
        id: 'ADMIN-CONTENT-TYPE-LIST',
    });

    Reactium.Component.register('useContentTypes', useContentTypes);
})();
