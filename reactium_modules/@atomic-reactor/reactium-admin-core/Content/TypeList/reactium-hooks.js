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
    ListItemDelete,
    ListItemIcon,
    ListItemMeta,
    ListItemTitle,
} from './ListItem';

(async () => {
    await Reactium.Plugin.register(
        'ContentTypeList',
        Reactium.Enums.priority.lowest,
    );

    Reactium.Zone.addComponent({
        order: -1000,
        component: Component,
        zone: ['admin-content-types'],
        id: 'ADMIN-CONTENT-TYPE-LIST',
    });

    Reactium.Component.register('useContentTypes', useContentTypes);

    Reactium.ContentType.ListComponents.register(
        'ADMIN-CONTENT-TYPE-LIST-ICON',
        {
            order: 50,
            Component: ListItemIcon,
            id: 'ADMIN-CONTENT-TYPE-LIST-ICON',
            zones: ['admin-content-type-list-item-left'],
        },
    );

    Reactium.ContentType.ListComponents.register(
        'ADMIN-CONTENT-TYPE-LIST-TITLE',
        {
            order: 60,
            Component: ListItemTitle,
            id: 'ADMIN-CONTENT-TYPE-LIST-TITLE',
            zones: ['admin-content-type-list-item-center'],
        },
    );

    Reactium.ContentType.ListComponents.register(
        'ADMIN-CONTENT-TYPE-LIST-META',
        {
            order: 65,
            Component: ListItemMeta,
            id: 'ADMIN-CONTENT-TYPE-LIST-META',
            zones: ['admin-content-type-list-item-center'],
        },
    );

    Reactium.ContentType.ListComponents.register(
        'ADMIN-CONTENT-TYPE-LIST-DELETE',
        {
            order: 70,
            Component: ListItemDelete,
            id: 'ADMIN-CONTENT-TYPE-LIST-DELETE',
            zones: ['admin-content-type-list-item-right'],
        },
    );

    Reactium.ContentType.ListComponents.register(
        'ADMIN-CONTENT-TYPE-LIST-COUNT',
        {
            order: 75,
            Component: ListItemCount,
            id: 'ADMIN-CONTENT-TYPE-LIST-COUNT',
            zones: ['admin-content-type-list-item-right'],
        },
    );

    Reactium.ContentType.ListComponents.register(
        'ADMIN-CONTENT-TYPE-LIST-ADD',
        {
            order: 85,
            Component: ListItemAdd,
            id: 'ADMIN-CONTENT-TYPE-LIST-ADD',
            zones: ['admin-content-type-list-item-right'],
        },
    );

    Reactium.Component.register('useContentTypes', useContentTypes);
})();
