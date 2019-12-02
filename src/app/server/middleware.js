const Enums = require('reactium-core/sdk/enums').default;
const {
    settings,
    routes,
    blueprints,
    plugins,
} = require('./middlewares/config');
const { forceSSL } = require('./middlewares/forceSSL');
const proxy = require('http-proxy-middleware');

module.exports = mw => {
    mw.push({
        name: 'media-proxy',
        use: proxy('/media', {
            target: restAPI.replace(/\/api$/, ''),
            changeOrigin: true,
            logLevel: process.env.DEBUG === 'on' ? 'debug' : 'error',
            ws: false,
        }),
        order: Enums.priority.highest,
    });

    mw.push({
        name: 'forceSSL',
        use: forceSSL,
        order: Enums.priority.highest,
    });

    mw.push({
        name: 'settings',
        use: settings,
        order: Enums.priority.highest,
    });

    mw.push({
        name: 'blueprints',
        use: blueprints,
        order: Enums.priority.highest,
    });

    mw.push({
        name: 'frontEndRoutes',
        use: routes,
        order: Enums.priority.highest,
    });

    mw.push({
        name: 'plugins',
        use: plugins,
        order: Enums.priority.highest,
    });

    return mw;
};
