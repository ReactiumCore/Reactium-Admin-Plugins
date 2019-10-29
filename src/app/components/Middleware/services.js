import Parse from 'appdir/api';
import op from 'object-path';

const getRoutes = async () => {
    const { routes } = await Parse.Cloud.run('routes');
    return routes.filter(({ blueprint }) => blueprint);
};

const blueprints = async () => {
    let allBlueprints = [];
    const options = { limit: 1000 };

    try {
        let results = await Parse.Cloud.run('blueprint-retrieve', options);
        while (results.blueprints.length > 0) {
            allBlueprints = allBlueprints.concat(results.blueprints);
            options.skip = allBlueprints.length;
            results = await Parse.Cloud.run('blueprint-retrieve', options);
        }
        return allBlueprints;
    } catch (error) {
        return allBlueprints;
    }
};

export default {
    getDynamicRoutes: async () => {
        const routes = await getRoutes();

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
