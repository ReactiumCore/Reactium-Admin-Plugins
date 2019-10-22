const { routes, blueprints } = require('./middlewares/config');
const { forceSSL } = require('./middlewares/forceSSL');

module.exports = mw => {
    return [
        {
            name: 'forceSSL',
            use: forceSSL,
        },
        {
            name: 'blueprints',
            use: blueprints,
        },
        {
            name: 'frontEndRoutes',
            use: routes,
        },
        ...mw,
    ];
};
