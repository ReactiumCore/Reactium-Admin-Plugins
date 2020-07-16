import React from 'react';
import Reactium, { __ } from 'reactium-core/sdk';
import ReactHelmet from 'react-helmet';
import Blueprint from './index';
import actions from './actions';
import op from 'object-path';

let blueprints =
    typeof window !== 'undefined' ? window.blueprints : global.blueprints;
let routesConfig =
    typeof window !== 'undefined' ? window.routesConfig : global.routesConfig;

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

Reactium.Component.register('Blueprint', Blueprint);

// Implement `helmet-props` hook with priority order than highest
// in your plugin to override these values
Reactium.Hook.register(
    'helmet-props',
    async context => {
        context.props = {
            titleTemplate: __('%s - Reactium CMS'),
        };
    },
    Reactium.Enums.priority.highest,
);

Reactium.Hook.register(
    'plugin-init',
    async () => {
        const context = await Reactium.Hook.run('helmet-props');

        const helmetProps = op.get(context, 'props', {});
        const Helmet = props => {
            const { children = null } = props;
            return <ReactHelmet {...helmetProps}>{children}</ReactHelmet>;
        };

        Reactium.Component.register('Helmet', Helmet);
    },
    Reactium.Enums.priority.lowest,
);

/**
 * @api {Hook} default-blueprint default-blueprint
 * @apiDescription Hook run on blueprint routing subscription to provide default
 blueprint if none exists for a route. In your hook implementation, you may modify the default blueprint object as a side-effect.
 * @apiName default-blueprint
 * @apiGroup Actinium-Admin.Hooks
 * @apiParam {Object} defaultBlueprint The default blueprint object.
 */
Reactium.Routing.subscribe(async () => {
    await Reactium.Hook.run('default-blueprint', defaultBlueprint);
    Reactium.Routing.get().forEach(route => {
        if (route.component === Blueprint && !route.load) {
            const config = op.get(routesConfig, route.path);
            const blueprint = op.get(
                blueprints,
                op.get(config, 'blueprint', 'default'),
                defaultBlueprint,
            );

            op.set(route, 'blueprint', blueprint);
            op.set(route, 'routeConfig', config);

            route.load = actions.loadFactory(route, config, blueprint);
        }
    });
});
