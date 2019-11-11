import op from 'object-path';
import Profile from './index';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

const sidebar = [
    {
        id: 'ADMIN-PROFILE-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-header'],
        order: -100000,
    },
];

const editors = [
    {
        id: 'ADMIN-PROFILE',
        component: Profile,
        zone: ['admin-profile'],
    },
];

Reactium.Plugin.register('AdminProfile').then(() => {
    // Sidebar Widget Components
    sidebar.forEach((widget, order) =>
        Reactium.Plugin.addComponent({
            ...widget,
            order: op.get(widget, 'order', order),
        }),
    );

    // Editor Widgets
    editors.forEach((widget, order) =>
        Reactium.Plugin.addComponent({
            ...widget,
            order: op.get(widget, 'order', order),
        }),
    );
});
