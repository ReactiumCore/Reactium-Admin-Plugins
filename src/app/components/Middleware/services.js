import Parse from 'appdir/api';
import op from 'object-path';

const getRoutes = async () => {
    const limit = 1;
    let skip = 0;
    let allRoutes = [];

    try {
        const { total, routes } = await Parse.Cloud.run('route-retrieve', {
            limit,
            skip,
        });
        if (routes.length === total) return routes;

        allRoutes = routes;
        const pages = Math.ceil(total / limit);
        for (let page = 1; page < pages; page++) {
            skip = limit * page;
            const { routes } = await Parse.Cloud.run('route-retrieve', {
                limit,
                skip,
            });
            allRoutes = allRoutes.concat(routes);
        }

        return allRoutes;
    } catch (error) {
        return allRoutes;
    }
};

const blueprints = async () => {
    const limit = 1;
    let skip = 0;
    let allBlueprints = [];

    try {
        const { total, blueprints } = await Parse.Cloud.run(
            'blueprint-retrieve',
            {
                limit,
                skip,
            },
        );
        if (blueprints.length === total) return blueprints;

        allBlueprints = blueprints;
        const pages = Math.ceil(total / limit);
        for (let page = 1; page < pages; page++) {
            skip = limit * page;
            const { blueprints } = await Parse.Cloud.run('blueprint-retrieve', {
                limit,
                skip,
            });
            allBlueprints = allBlueprints.concat(blueprints);
        }

        return allBlueprints;
    } catch (error) {
        return allBlueprints;
    }
};

export default {
    getDynamicRoutes: async () => {
        const dynamicRoutes = await getRoutes();
        const routes = dynamicRoutes.map(route => route.toJSON());

        return {
            routesConfig: routes.reduce(
                (routesConfig, { route, blueprint, meta, capabilities }) => {
                    routesConfig[route] = {
                        meta,
                        capabilities,
                        blueprint: blueprint.ID,
                    };

                    return routesConfig;
                },
                {},
            ),
            routes: routes.map(({ route, meta }) => ({
                path: route,
                exact: op.get(meta, 'exact', true),
                order: op.get(meta, 'order', 0),
                component: 'Blueprint',
            })),
        };
    },

    getBlueprints: async () => {
        const allBlueprints = await blueprints();
        return allBlueprints
            .map(blueprint => blueprint.toJSON())
            .reduce((allById, blueprint) => {
                allById[blueprint.ID] = blueprint;
                return allById;
            }, {});
    },
};
