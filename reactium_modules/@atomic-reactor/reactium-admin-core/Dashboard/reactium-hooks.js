import SDK from './sdk';
import React from 'react';
import Dashboard from './index';
import actions from './actions';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';

const AdminDashboardPlugin = async () => {
    await Reactium.Plugin.register(
        'AdminDashboard',
        Reactium.Enums.priority.highest,
    );

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD',
        component: Dashboard,
        zone: ['admin-dashboard'],
        order: Reactium.Enums.priority.highest,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: 100,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD-BREADCRUMBS-WIDGET',
        component: Breadcrumbs,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-header'],
    });

    Reactium.Dashboard = SDK;

    Reactium.Hook.register('blueprint-load', async (params, context) => {
        const { dispatch, getState, route, blueprint } = params;
        if (blueprint.ID === 'Admin' || route.path === '/admin') {
            context.data = await actions.load()(dispatch, getState);
        }
    });
};

AdminDashboardPlugin();
