import _ from 'underscore';
import cn from 'classnames';
import UserList, { EmailWidget, ListWidgets } from './List';
import SidebarWidget from './SidebarWidget';
import Reactium from 'reactium-core/sdk';

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
});
