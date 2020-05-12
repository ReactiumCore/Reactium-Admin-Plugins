import op from 'object-path';
import _ from 'underscore';
import Reactium from 'reactium-core/sdk';
import pageServices from '../services';

module.exports = {
    settings: async (req, res, next) => {
        req.settings = global.settings = await Reactium.Cloud.run('settings');
        next();
    },

    blueprints: async (req, res, next) => {
        req.blueprints = global.blueprints = await pageServices.getBlueprints();
        next();
    },

    routes: async (req, res, next) => {
        const { routesConfig, routes } = await pageServices.getDynamicRoutes();
        req.routesConfig = global.routesConfig = routesConfig;
        req.routes = global.routes = routes;
        next();
    },

    plugins: async (req, res, next) => {
        const { plugins } = await Reactium.Cloud.run('plugins');
        req.plugins = global.plugins = plugins;

        next();
    },
};
