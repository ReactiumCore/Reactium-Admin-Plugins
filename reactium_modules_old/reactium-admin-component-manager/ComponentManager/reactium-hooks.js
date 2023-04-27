import Component from './index';
import SaveWidget from './SaveWidget';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';
import RTE from './RTE';

Reactium.Plugin.register('ComponentManager').then(() => {
    Reactium.Component.register('ComponentManager', Component);

    // RTE Plugin
    Reactium.RTE.Plugin.register('block', RTE);

    Reactium.Zone.addComponent({
        id: 'ADMIN-COMPONENTS',
        zone: ['admin-components'],
        component: Component,
        order: 0,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-COMPONENTS-SIDEBAR-WIDGET',
        component: SidebarWidget,
        order: 600,
        zone: ['admin-sidebar-menu'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-COMPONENTS-CRUMBS',
        component: Breadcrumbs,
        order: 1,
        zone: ['admin-header'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-COMPONENTS-SAVE-WIDGET',
        zone: ['admin-logo'],
        component: SaveWidget,
        order: 100,
    });
});
