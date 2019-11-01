import op from 'object-path';
import Reactium from 'reactium-core/sdk';
import pageServices from 'components/Middleware/services';

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
};
