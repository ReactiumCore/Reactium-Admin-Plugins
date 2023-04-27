import Reactium, { __ } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';
import Enums from './enums';
import Blueprint from './index';

const routingApp =
    op.get(typeof global !== 'undefined' ? global : window, 'routingApp') ||
    'admin';

export const DEFAULTS = [
    {
        sections: {
            main: {
                zones: ['content'],
                meta: {},
            },
        },
        meta: {
            builtIn: true,
            admin: true,
        },
        ID: 'Simple',
        description: 'Blueprint with one simple content section',
        className: 'Blueprint',
    },
    {
        sections: {
            sidebar: {
                zones: ['admin-sidebar'],
                meta: {},
            },
            main: {
                zones: ['admin-header', 'admin-dashboard', 'admin-actions'],
                meta: {},
            },
        },
        meta: {
            builtIn: true,
            admin: true,
            namespace: 'admin-page',
        },
        ID: 'Admin',
        description: 'Admin blueprint',
        className: 'Blueprint',
    },
    {
        sections: {
            sidebar: {
                zones: ['admin-sidebar'],
                meta: {},
            },
            main: {
                zones: ['admin-header', 'admin-profile', 'admin-actions'],
                meta: {},
            },
        },
        meta: {
            builtIn: true,
            admin: true,
            namespace: 'admin-page',
        },
        ID: 'Profile',
        description: 'Profile blueprint',
        className: 'Blueprint',
    },
];

const defaultBlueprint = {
    sections: {
        sidebar: {
            zones: ['admin-sidebar'],
            meta: {},
        },
        main: {
            zones: ['admin-header', 'admin-dashboard', 'admin-actions'],
            meta: {},
        },
    },
    meta: {
        builtIn: true,
        admin: true,
        namespace: 'admin-page',
    },
    ID: 'Admin',
    description: 'Admin blueprint',
    className: 'Blueprint',
};

// Build Blueprint Registry
const SDK = (Reactium.Blueprint = Reactium.Utils.registryFactory(
    'Blueprint',
    'ID',
    Reactium.Utils.Registry.MODES.CLEAN,
));

Reactium.Hook.register(
    'blueprints',
    async () => {
        for (const bp of DEFAULTS) {
            if (!op.has(bp, 'sections.tools')) {
                op.set(bp, 'sections.tools', {
                    zones: ['admin-tools'],
                });

                Reactium.Blueprint.register(bp.ID, bp);
            }
        }
    },
    Reactium.Enums.priority.highest,
    'DEFAULT_ROUTES',
);

const CACHE_DURATION = 10000;
const CACHE_KEY = 'BLUEPRINT_ROUTES';

Reactium.Blueprint.initRoutes = async () => {
    /**
     * @api {Hook} default-blueprint default-blueprint
     * @apiDescription Hook defining default blueprint configuration if none has been provided that matches the current routes' blueprint id.
     * @apiName default-blueprint
     * @apiGroup Actinium-Admin.Hooks
     * @apiParam {Object} defaultBlueprint The default blueprint object.
     */
    await Reactium.Hook.run('default-blueprint', defaultBlueprint);
    Reactium.Blueprint.register(defaultBlueprint.ID, defaultBlueprint);
    await Reactium.Hook.run('blueprints', Reactium.Blueprint);

    let routes = Reactium.Cache.get(CACHE_KEY);
    if (!routes) {
        // Load Routes
        // const notAdmin = new Reactium.Query('Route').notEqualTo(
        //     'meta.app',
        //     'admin',
        // );
        const noAppProp = new Reactium.Query('Route').doesNotExist('meta.app');
        const hasAppRoute = new Reactium.Query('Route').equalTo(
            'meta.app',
            routingApp,
        );

        // TODO: Make this behavior dynamic based on context (admin / app)
        const baseQuery = Reactium.Query.or(noAppProp, hasAppRoute);
        // const baseQuery = Reactium.Query.and(
        //     notAdmin,
        //     Reactium.Query.or(noAppProp, hasAppRoute),
        // );

        try {
            routes = (await baseQuery.find()).map(r => r.toJSON());
            Reactium.Cache.set(CACHE_KEY, routes, CACHE_DURATION);
        } catch (error) {
            console.error('Unable to load routes!', error);
        }
    }

    // gather relevant route capabilities ahead of time
    let permissions = {};
    const capChecks = {};
    routes.forEach(route => {
        const isPermitted = op.get(route, 'permitted');
        if (typeof isPermitted === 'boolean') {
            permissions[route.objectId] = isPermitted;
            return;
        }

        const capabilities = _.chain([op.get(route, 'capabilities')])
            .flatten()
            .compact()
            .value()
            .filter(cap => typeof cap === 'string');

        if (Array.isArray(capabilities) && capabilities.length > 0)
            op.set(capChecks, route.objectId, {
                capabilities,
                strict: false,
            });
    });

    // check permissions in bulk for current user
    if (Object.keys(capChecks).length > 0) {
        try {
            permissions = {
                ...permissions,
                ...(await Reactium.Cloud.run('capability-bulk-check', {
                    checks: capChecks,
                })),
            };
        } catch (error) {
            console.error(error);
            return;
        }
    }

    // Register All routes User has permission to see
    for (const r of routes) {
        const {
            objectId: id,
            route: path,
            blueprint: blueprintId,
            meta,
            capabilities,
        } = r;

        const blueprint =
            Reactium.Blueprint.get(blueprintId) || defaultBlueprint;

        const route = {
            id,
            path,
            order: op.get(r, 'meta.order', Reactium.Enums.priority.normal),
            meta,
            blueprint,
            capabilities,

            // blueprint transitions on by default
            transitions: op.get(blueprint, 'meta.transitions', true) === true,
            transitionStates: op.get(
                blueprint,
                'meta.transitionStates',
                Enums.transitionStates,
            ),
        };

        if (op.get(permissions, id, true) === true) {
            op.set(route, 'component', Blueprint);
            await Reactium.Routing.register(route);
        }
    }
};

export default SDK;
