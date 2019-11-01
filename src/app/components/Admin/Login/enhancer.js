import Reactium from 'reactium-core/sdk';
import { matchPath } from 'react-router';
import op from 'object-path';

const defaultLoginRoute = '/login';
Reactium.Hook.register(
    'route-unauthorized',
    context => {
        context.loginRoute = defaultLoginRoute;
        return Promise.resolve();
    },
    Reactium.Enums.priority.highest,
);

const enforceBlueprintCaps = (store, history) => async location => {
    const routes = Reactium.Routing.get();

    const { route, match } =
        routes
            .filter(route => route.path)
            .map(route => {
                let match = matchPath(location.pathname, route);
                return { route, match };
            })
            .filter(route => route.match)
            .find(({ route, match }) => {
                return match.isExact;
            }) || {};

    if (match) {
        const pathname = op.get(route, 'path', '/');
        const blueprint = op.get(store.getState(), [
            'Blueprint',
            'routesConfig',
            pathname,
        ]);
        const context = await Reactium.Hook.run('route-unauthorized');
        const login = op.get(context, 'loginRoute', defaultLoginRoute);

        if (blueprint) {
            const capabilities = op.get(blueprint, 'capabilities', []);
            // restricted route
            if (pathname !== login && capabilities.length > 0) {
                // if user has any capability, allow
                for (let capability of capabilities) {
                    const permitted = await Reactium.User.can(capability);
                    if (permitted) return;
                }

                history.push(login);
            }
        }
    }
};

export default (enhancers = [], isServer = false) => {
    return [
        {
            name: 'route-observer',
            order: 1000,
            enhancer: isServer
                ? _ => _
                : storeCreator => (...args) => {
                      const store = storeCreator(...args);

                      Reactium.Hook.register(
                          'history-create',
                          async ({ history }) => {
                              enforceBlueprintCaps(store, history)(
                                  window.location,
                              );
                              history.listen(
                                  enforceBlueprintCaps(store, history),
                              );

                              return Promise.resolve();
                          },
                          Reactium.Enums.priority.high,
                      );

                      return store;
                  },
        },
        ...enhancers,
    ];
};
