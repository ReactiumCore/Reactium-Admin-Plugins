import React from 'react';
import Dashboard from './index';
import Reactium from 'reactium-core/sdk';
import SidebarWidget from './SidebarWidget';
import SDK from './sdk';
import actions from './actions';

const DB = () => 'Dash';

const AdminDashboardPlugin = async () => {
    await Reactium.Plugin.register(
        'AdminDashboard',
        Reactium.Enums.priority.highest,
    );

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD',
        component: Dashboard,
        zone: ['admin-content'],
        order: -1000,
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-DASHBOARD-SIDEBAR-WIDGET',
        component: SidebarWidget,
        zone: ['admin-sidebar-menu'],
        order: 100,
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
