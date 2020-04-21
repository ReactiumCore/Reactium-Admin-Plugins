import Reactium from 'reactium-core/sdk';
import { matchPath } from 'react-router';
import op from 'object-path';

const defaultLoginRoute = '/login';
Reactium.Hook.register(
    'route-unauthorized',
    async context => {
        context.loginRoute = defaultLoginRoute;
    },
    Reactium.Enums.priority.highest,
);

const redirectLogin = async history => {
    const context = await Reactium.Hook.run('route-unauthorized');
    const path = op.get(context, 'loginRoute', defaultLoginRoute);
    window.location.href = path;
};

const enforceBlueprintCaps = (store, history, loginPath) => async location => {
    const routes = Reactium.Routing.get();

    const { route, match } =
        routes
            .filter(route => route.path)
            .map(route => {
                let match = matchPath(location.pathname, route);
                return { route, match };
            })
            .filter(route => route.match)
            .find(({ match }) => {
                return match.isExact;
            }) || {};

    if (match) {
        const pathname = op.get(route, 'path', '/');
        const blueprint = op.get(route, 'blueprint', {});
        const routeConfig = op.get(route, 'routeConfig', {});

        if (blueprint && routeConfig) {
            const capabilities = op.get(routeConfig, 'capabilities', []);

            // restricted route
            if (pathname !== loginPath && capabilities.length > 0) {
                const loggedIn = await Reactium.User.hasValidSession();
                const permitted = await Reactium.Capability.check(capabilities);

                // permitted, proceed
                if (permitted) return;
                console.log('redirect');
                if (pathname === '/') await redirectLogin(history, loginPath);
                else history.push('/');
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
                              const context = await Reactium.Hook.run(
                                  'route-unauthorized',
                              );
                              const loginPath = op.get(
                                  context,
                                  'loginRoute',
                                  defaultLoginRoute,
                              );

                              Reactium.Hook.register(
                                  'user.after.logout',
                                  async () => {
                                      await redirectLogin(history, loginPath);
                                  },
                              );

                              enforceBlueprintCaps(
                                  store,
                                  history,
                                  loginPath,
                              )(window.location);
                              history.listen(
                                  enforceBlueprintCaps(
                                      store,
                                      history,
                                      loginPath,
                                  ),
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
