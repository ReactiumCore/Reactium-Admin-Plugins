const Enums = require('reactium-core/sdk/enums').default;
const { settings, routes, blueprints } = require('./middlewares/config');
const { forceSSL } = require('./middlewares/forceSSL');

module.exports = mw => {
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

    return mw;
};
