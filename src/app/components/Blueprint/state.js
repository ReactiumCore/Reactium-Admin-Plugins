/**
 * Blueprint Initial State
 */
export default {
    blueprints:
        typeof window !== 'undefined' ? window.blueprints : global.blueprints,

    routesConfig:
        typeof window !== 'undefined'
            ? window.routesConfig
            : global.routesConfig,

    // do not persist to local storage (default)
    // see https://www.npmjs.com/package/redux-local-persist
    persist: false,

    defaultBlueprint: {
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
    },
};
