const op = require('object-path');
const _ = require('underscore');
const Reactium = require('reactium-core/sdk').default;

module.exports = {
    plugins: async (req, res, next) => {
        try {
            const { plugins } = await Reactium.Cloud.run('plugins');
            req.plugins = global.plugins = plugins;
        } catch (error) {
            console.error('Unable to load plugins list', error);
        }
        next();
    },
};
