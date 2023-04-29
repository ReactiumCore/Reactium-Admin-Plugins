/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin TypeList
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';
import { useContentTypes } from './useContentTypes';
import {
    ListItemAdd,
    ListItemCount,
    ListItemIcon,
    ListItemMeta,
    ListItemTitle,
    ListItemRegistry,
} from './ListItem';

(async () => {
    Reactium.Zone.addComponent({
        order: -1000,
        component: Component,
        zone: ['admin-content-types'],
        id: 'ADMIN-CONTENT-TYPE-LIST',
    });

    Reactium.Component.register('useContentTypes', useContentTypes);

    ListItemRegistry.register('ADMIN-CONTENT-TYPE-LIST-ICON', {
        order: 50,
        Component: ListItemIcon,
        id: 'ADMIN-CONTENT-TYPE-LIST-ICON',
        zones: ['admin-content-type-list-item-left'],
    });

    ListItemRegistry.register('ADMIN-CONTENT-TYPE-LIST-TITLE', {
        order: 60,
        Component: ListItemTitle,
        id: 'ADMIN-CONTENT-TYPE-LIST-TITLE',
        zones: ['admin-content-type-list-item-center'],
    });

    ListItemRegistry.register('ADMIN-CONTENT-TYPE-LIST-META', {
        order: 65,
        Component: ListItemMeta,
        id: 'ADMIN-CONTENT-TYPE-LIST-META',
        zones: ['admin-content-type-list-item-center'],
    });

    ListItemRegistry.register('ADMIN-CONTENT-TYPE-LIST-COUNT', {
        order: 70,
        Component: ListItemCount,
        id: 'ADMIN-CONTENT-TYPE-LIST-COUNT',
        zones: ['admin-content-type-list-item-right'],
    });

    ListItemRegistry.register('ADMIN-CONTENT-TYPE-LIST-ADD', {
        order: 80,
        Component: ListItemAdd,
        id: 'ADMIN-CONTENT-TYPE-LIST-ADD',
        zones: ['admin-content-type-list-item-right'],
    });

    Reactium.Component.register('useContentTypes', useContentTypes);
})();
