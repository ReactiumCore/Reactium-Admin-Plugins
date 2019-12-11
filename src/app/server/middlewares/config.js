import op from 'object-path';
import _ from 'underscore';
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

    plugins: async (req, res, next) => {
        const { plugins } = await Reactium.Cloud.run('plugins');
        req.plugins = global.plugins = plugins;

        const styles = [];
        const scripts = [];

        _.sortBy(plugins, 'order').forEach(plugin => {
            if (plugin.active) {
                styles.push(op.get(plugin, 'meta.styleURL'));
                scripts.push(op.get(plugin, 'meta.scriptURL'));
            }
        });

        req.pluginAssets = {
            styles: _.compact(styles)
                .map(url => {
                    if (!/^http/.test(url)) url = '/api' + url;
                    return `<link rel="stylesheet" href="${url}" />`;
                })
                .join('\n'),
            scripts: _.compact(scripts)
                .map(url => {
                    if (!/^http/.test(url)) url = '/api' + url;
                    return `<script src="${url}"></script>`;
                })
                .join('\n'),
        };

        next();
    },
};
