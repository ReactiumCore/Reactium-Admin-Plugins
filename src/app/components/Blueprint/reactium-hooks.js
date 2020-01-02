import Reactium from 'reactium-core/sdk';
import Helmet from 'react-helmet';
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
    },
    meta: {},
    ID: 'Default',
    description: 'Default blueprint',
};

Reactium.Component.register('Helmet', Helmet);

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
    Reactium.Routing.routes.forEach(route => {
        if (route.component === Blueprint && !route.load) {
            const config = op.get(routesConfig, route.path);
            const blueprint = op.get(
                blueprints,
                config.blueprint,
                defaultBlueprint,
            );
            route.load = actions.loadFactory(route, config, blueprint);
        }
    });
});
