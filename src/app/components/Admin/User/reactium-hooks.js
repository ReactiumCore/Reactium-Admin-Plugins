import _ from 'underscore';
import cn from 'classnames';
import Order from './List/Order';
import Filters from './List/Filters';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import HeaderWidget from './HeaderWidget';
import Pagination from './List/Pagination';
import SidebarWidget from './SidebarWidget';
import UserEditor from './Editor';
import UserList, { EmailWidget, ListWidgets } from './List';

Reactium.Plugin.register(
    'AdminUsers',
    Reactium.Enums.priority.high.lowest,
).then(() => {
    // User SKD Additions DirtyEvent, ScrubEvent
    Reactium.User.DirtyEvent = Reactium.Utils.registryFactory('UserDirtyEvent');
    Reactium.User.DirtyEvent.protect(['change', 'loading']);
    Reactium.User.DirtyEvent.protected.forEach(id =>
        Reactium.User.DirtyEvent.register(id),
    );

    Reactium.User.ScrubEvent = Reactium.Utils.registryFactory('UserScrubEvent');
    Reactium.User.ScrubEvent.protect(['loaded', 'save-success']);
    Reactium.User.ScrubEvent.protected.forEach(id =>
        Reactium.User.ScrubEvent.register(id),
    );

    Reactium.Zone.addComponent({
        id: 'AdminUserList',
        component: UserList,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-user-list'],
    });

    Reactium.Zone.addComponent({
        id: 'AdminUserEditor',
        component: UserEditor,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-user-editor'],
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
        id: 'ADMIN-USER-LIST-FILTER',
        component: Filters,
        order: Reactium.Enums.priority.lowest + 1,
        zone: ['admin-user-list-toolbar'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-LIST-ORDER',
        component: Order,
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
