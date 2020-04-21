import Parse from 'appdir/api';
import op from 'object-path';

const getRoutes = async () => {
    const { routes } = await Parse.Cloud.run('routes');
    return routes.filter(({ blueprint }) => blueprint);
};

export default {
    getDynamicRoutes: async () => {
        const routes = await getRoutes();
        const routesConfig = {};
        routes.forEach(
            ({ route, blueprint, meta, capabilities = [] }) =>
                (routesConfig[route] = {
                    meta,
                    capabilities,
                    blueprint,
                }),
        );

        return {
            routesConfig,
            routes: routes.map(({ route, meta }) => ({
                path: route,
                exact: op.get(meta, 'exact', true),
                order: op.get(meta, 'order', 0),
                component: 'Blueprint',
            })),
        };
    },

    getBlueprints: async () => {
        const blueprints = await Parse.Cloud.run('blueprints');
        const bluePrintsById = {};
        blueprints.forEach(blueprint => {
            bluePrintsById[blueprint.ID] = blueprint;
        });

        return bluePrintsById;
    },
};
