import op from 'object-path';
import UserList from './List';
import UserEditor from './Editor';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import HeaderWidget from './HeaderWidget';
import SidebarWidget from './SidebarWidget';

import {
    EmailWidget,
    Filters,
    ListWidgets,
    Order,
    Pagination,
} from './List/_plugins';

import {
    Notice,
    UserMedia,
    UserContent,
    UserInputs,
    UserProfile,
} from './Editor/_plugins';

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

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-EDITOR-PROFILE',
        component: UserProfile,
        zone: ['admin-user-editor-profile'],
        order: Reactium.Enums.priority.lowest,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-EDITOR-NOTICE',
        component: Notice,
        zone: ['admin-user-editor-profile'],
        order: Reactium.Enums.priority.lowest + 1,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-EDITOR-CONTENT',
        component: UserContent,
        zone: ['admin-user-content'],
        order: Reactium.Enums.priority.lowest,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-EDITOR-MEDIA',
        component: UserMedia,
        zone: ['admin-user-media'],
        order: Reactium.Enums.priority.lowest,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-USER-EDITOR-FORM',
        component: UserInputs,
        zone: ['admin-user-editor-form'],
    });

    Reactium.Hook.register(
        'user.before.logout',
        async () => {
            const { objectId } = Reactium.User.current();
            const prefs = Reactium.Prefs.get();
            const shallowPrefs = Object.keys(prefs).reduce((obj, key) => {
                obj[key] = op.get(prefs, key);
                return obj;
            }, {});

            await Reactium.User.Pref.update({ objectId, ...shallowPrefs });
            Reactium.Prefs.clear();
        },
        Reactium.Enums.priority.lowest,
    );

    Reactium.Hook.register(
        'user.after.logout',
        async () => {
            window.location.href = '/login';
        },
        Reactium.Enums.priority.lowest,
    );

    Reactium.Hook.register(
        'user.auth',
        async u => {
            const prefs = op.get(u, 'pref', {}) || {};
            localStorage.setItem('ar-prefs', JSON.stringify(prefs));
        },
        Reactium.Enums.priority.lowest,
    );
});
