import React from 'react';
import Reactium, { __ } from 'reactium-core/sdk';
import ReactHelmet from 'react-helmet';
import Blueprint from './index';
import actions from './actions';
import op from 'object-path';
import _ from 'underscore';
import { Redirect } from 'react-router-dom';

const defaultBlueprint = {
    sections: {
        sidebar: {
            zones: ['admin-sidebar'],
            meta: {},
        },
        main: {
            zones: ['admin-header', 'admin-content', 'admin-actions'],
            meta: {},
        },
        tools: {
            zones: ['admin-tools'],
        },
    },
    meta: {
        builtIn: true,
        admin: true,
        namespace: 'admin-page',
    },
    ID: 'Default',
    description: 'Admin default blueprint',
    className: 'Blueprint',
};

Reactium.Hook.register('routes-init', async () => {
    Reactium.Component.register('Blueprint', Blueprint);

    // Build Blueprint Registry
    Reactium.Blueprint = Reactium.Utils.registryFactory(
        'Blueprint',
        'ID',
        Reactium.Utils.Registry.MODES.CLEAN,
    );

    /**
     * @api {Hook} default-blueprint default-blueprint
     * @apiDescription Hook defining default blueprint configuration if none has been provided that matches the current routes' blueprint id.
     * @apiName default-blueprint
     * @apiGroup Actinium-Admin.Hooks
     * @apiParam {Object} defaultBlueprint The default blueprint object.
     */

    await Reactium.Hook.run('default-blueprint', defaultBlueprint);
    Reactium.Blueprint.register(defaultBlueprint.ID, defaultBlueprint);
    (await Reactium.Cloud.run('blueprints')).forEach(bp =>
        Reactium.Blueprint.register(bp.ID, bp),
    );
    await Reactium.Hook.run('blueprints', Reactium.Blueprint);

    // Load Routes
    const { routes = [] } = await Reactium.Cloud.run('routes');

    // gather relevant route capabilities ahead of time
    let permissions = {};
    const capChecks = {};
    routes.forEach(route => {
        const isPermitted = op.get(route, 'permitted');
        if (typeof isPermitted === 'boolean') {
            permissions[route.objectId] = isPermitted;
            return;
        }

        const capabilities = _.chain([op.get(route, 'capabilities')])
            .flatten()
            .compact()
            .value()
            .filter(cap => typeof cap === 'string');

        if (Array.isArray(capabilities) && capabilities.length > 0)
            op.set(capChecks, route.objectId, { capabilities, strict: false });
    });

    // check permissions in bulk for current user
    if (Object.keys(capChecks).length > 0) {
        try {
            permissions = {
                ...permissions,
                ...(await Reactium.Cloud.run('capability-bulk-check', {
                    checks: capChecks,
                })),
            };
        } catch (error) {
            console.error(error);
            return;
        }
    }

    // Register All routes User has permission to see
    for (const r of routes) {
        const { objectId: id, route: path, blueprint, meta, capabilities } = r;
        const route = {
            id,
            path,
            order: op.get(r, 'meta.order', Reactium.Enums.priority.normal),
            meta,
            blueprint: Reactium.Blueprint.get(blueprint) || defaultBlueprint,
            capabilities,
        };

        if (op.get(permissions, id, true) === true) {
            op.set(
                route,
                'thunk',
                actions.loadFactory(
                    route,
                    {
                        blueprint,
                        capabilities,
                        meta,
                    },
                    route.blueprint,
                ),
            );
            op.set(route, 'component', Blueprint);
        } else {
            op.del(route, 'load');
            op.set(route, 'component', () => <Redirect to={'/login'} />);
        }

        await Reactium.Routing.register(route);
    }

    // If there is no / route, create a redirect to /admin
    if (!routes.find(({ path }) => path === '/')) {
        await Reactium.Routing.register({
            id: 'admin-redirect',
            path: '/',
            exact: true,
            component: () => <Redirect to={'/admin'} />,
            order: Reactium.Enums.priority.highest,
        });
    }
});

Reactium.Hook.register('plugin-init', async () => {
    // Implement `helmet-props` hook with priority order than highest
    // in your plugin to override these values
    Reactium.Hook.register(
        'helmet-props',
        async context => {
            context.props = {
                titleTemplate: __('%s - Reactium Admin'),
            };
        },
        Reactium.Enums.priority.highest,
    );

    const context = await Reactium.Hook.run('helmet-props');
    const helmetProps = op.get(context, 'props', {});

    const Helmet = props => {
        const { children = null } = props;
        return <ReactHelmet {...helmetProps}>{children}</ReactHelmet>;
    };

    Reactium.Component.register('Helmet', Helmet);
});
