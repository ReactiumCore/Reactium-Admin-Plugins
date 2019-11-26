module.exports = config => {
    config.pluginExternals['reactium-ui'] = {
        externalName: '/reactium-ui$/',
        requirePath: '@atomic-reactor/reactium-ui',
    };

    return config;
};
