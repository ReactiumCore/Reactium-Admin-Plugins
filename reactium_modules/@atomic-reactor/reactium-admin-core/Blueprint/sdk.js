import Reactium, { __ } from '@atomic-reactor/reactium-core/sdk';
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

// Build Blueprint Registry
const SDK = (Reactium.Blueprint = Reactium.Utils.registryFactory(
    'Blueprint',
    'ID',
    Reactium.Utils.Registry.MODES.CLEAN,
));

// TODO: Portal Tools to page with or without the section
const sanitizeBP = (bp) => {
    const sanitized = { ...bp };

    if (!op.has(sanitized, 'sections.tools')) {
        op.set(sanitized, 'sections.tools', {
            zones: ['admin-tools'],
        });
    }
    if (
        !op.get(sanitized, 'sections.tools.zones', []).includes('admin-tools')
    ) {
        op.set(
            sanitized,
            'sections.tools.zones',
            op.get(sanitized, 'sections.tools.zones', []).concat('admin-tools'),
        );
    }
    return sanitized;
};

Reactium.Hook.register(
    'blueprints',
    async () => {
        for (const bp of DEFAULTS) {
            const blueprint = sanitizeBP(bp);
            Reactium.Blueprint.register(blueprint.ID, blueprint);
        }
    },
    Reactium.Enums.priority.highest,
    'DEFAULT_ROUTES',
);

const CACHE_DURATION = 10000;
const CACHE_KEY = 'BLUEPRINT_ROUTES';

Reactium.Blueprint.initRoutes = async () => {
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
            routes = (await baseQuery.find()).map((r) => r.toJSON());
            Reactium.Cache.set(CACHE_KEY, routes, CACHE_DURATION);
        } catch (error) {
            console.error('Unable to load routes!', error);
        }
    }

    // gather relevant route capabilities ahead of time
    let permissions = {};
    const capChecks = {};
    routes.forEach((route) => {
        const isPermitted = op.get(route, 'permitted');
        if (typeof isPermitted === 'boolean') {
            permissions[route.objectId] = isPermitted;
            return;
        }

        const capabilities = _.chain([op.get(route, 'capabilities')])
            .flatten()
            .compact()
            .value()
            .filter((cap) => typeof cap === 'string');

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
            Reactium.Blueprint.get(blueprintId) ||
            Reactium.Blueprint.get('Admin');

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
