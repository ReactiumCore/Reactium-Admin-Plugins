const op = require('object-path');
const _ = require('underscore');
const Reactium = require('reactium-core/sdk').default;

module.exports = {
    plugins: async (req, res, next) => {
        const { plugins } = await Reactium.Cloud.run('plugins');
        req.plugins = global.plugins = plugins;
        next();
    },
};
