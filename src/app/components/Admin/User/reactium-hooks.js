import _ from 'underscore';
import cn from 'classnames';
import Filters from './List/Filters';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import HeaderWidget from './HeaderWidget';
import Pagination from './List/Pagination';
import SidebarWidget from './SidebarWidget';
import UserList, { EmailWidget, ListWidgets } from './List';

Reactium.Plugin.register(
    'AdminUsers',
    Reactium.Enums.priority.high.lowest,
).then(() => {
    Reactium.Zone.addComponent({
        id: 'AdminUserList',
        component: UserList,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-user-list'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USERS-SIDEBAR-WIDGET',
        component: SidebarWidget,
        order: 500,
        zone: ['admin-sidebar-menu'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USERS-BREADCRUMBS-WIDGET',
        component: Breadcrumbs,
        order: 1,
        zone: ['admin-header'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USERS-HEADER-WIDGET',
        component: HeaderWidget,
        order: 1,
        zone: ['admin-logo'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-LIST-WIDGETS',
        component: ListWidgets,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-user-list-item-actions-right'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-LIST-WIDGETS-EMAIL',
        component: EmailWidget,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-user-list-item-actions'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-LIST-TOOLBAR',
        component: Filters,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-user-list-toolbar'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-LIST-PAGINATION-TOOLBAR',
        component: Pagination,
        order: Reactium.Enums.priority.highest,
        zone: ['admin-user-list-toolbar'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-LIST-PAGINATION',
        component: Pagination,
        zone: ['admin-user-list-bottom'],
    });
});
