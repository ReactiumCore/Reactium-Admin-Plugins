/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin List
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import { Helmet } from 'react-helmet';
import { SearchBar } from '../SearchBar';
import { useContent } from './useContent';
import Reactium from '@atomic-reactor/reactium-core/sdk';
import { SearchFilters, SearchFilterOptions } from '../SearchBar/SearchFilters';

import {
    ListItemDelete,
    ListItemMeta,
    ListItemStatus,
    ListItemTitle,
} from '../ListItem';

(async () => {
    await Reactium.Plugin.register(
        'ContentList',
        Reactium.Enums.priority.lowest,
    );

    Reactium.Component.register('Helmet', Helmet);

    Reactium.Component.register('useContent', useContent);

    Reactium.Zone.addComponent({
        order: -1000,
        component: Component,
        zone: ['admin-content-list'],
        id: 'ADMIN-CONTENT-LIST',
    });

    Reactium.Zone.addComponent({
        order: 100,
        component: SearchBar,
        zone: ['admin-content-list-top'],
        id: 'ADMIN-CONTENT-LIST-SEARCH',
    });

    Reactium.Zone.addComponent({
        order: 100,
        component: SearchFilters,
        id: 'ADMIN-CONTENT-LIST-SEARCH-FILTERS',
        zone: ['admin-content-list-search-actions'],
    });

    Reactium.Zone.addComponent({
        order: 20,
        component: SearchFilterOptions,
        id: 'ADMIN-CONTENT-LIST-SEARCH-FILTERS',
        zone: ['admin-content-list-search-filter-menu'],
    });

    Reactium.Content.ListComponents.register('ADMIN-CONTENT-LIST-TITLE', {
        order: 60,
        Component: ListItemTitle,
        id: 'ADMIN-CONTENT-LIST-TITLE',
        zones: ['admin-content-list-item-center'],
    });

    Reactium.Content.ListComponents.register('ADMIN-CONTENT-LIST-META', {
        order: 65,
        Component: ListItemMeta,
        id: 'ADMIN-CONTENT-LIST-META',
        zones: ['admin-content-list-item-center'],
    });

    Reactium.Content.ListComponents.register('ADMIN-CONTENT-LIST-DELETE', {
        order: 70,
        Component: ListItemDelete,
        id: 'ADMIN-CONTENT-LIST-DELETE',
        zones: ['admin-content-list-item-right'],
    });

    Reactium.Content.ListComponents.register('ADMIN-CONTENT-LIST-STATUS', {
        order: 75,
        Component: ListItemStatus,
        id: 'ADMIN-CONTENT-LIST-STATUS',
        zones: ['admin-content-list-item-right'],
    });
})();
