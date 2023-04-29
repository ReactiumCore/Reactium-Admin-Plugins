import Reactium from 'reactium-core/sdk';
import op from 'object-path';
import SDK from './sdk';
import Blueprint from './index';

const routingStateHandler = async updates => {
    if (op.get(updates, 'transitionState') === 'LOADING') {
        const routeLoader = async () => {};
        await Reactium.Hook.run('blueprint-route-loader', routeLoader, updates);
        const setLoading = op.get(
            window,
            'LoadingRef.current.setVisible',
            () => {},
        );
        try {
            setLoading(true);
            await routeLoader();
            await new Promise(resolve => setTimeout(resolve, 0));
        } catch (error) {
            // TODO: DO SOMETHING ABOUT IT! Error route?
            console.log('Error while loading route', error, updates);
        }

        setLoading(false);
        Reactium.Routing.nextState();
    }
};

const observer = async () => {
    Reactium.Routing.routeListeners.register('blueprint-routing-observer', {
        handler: routingStateHandler,
        order: Reactium.Enums.priority.low,
    });
};

Reactium.Hook.register(
    'routes-init',
    SDK.initRoutes,
    Reactium.Enums.priority.highest,
);

Reactium.Hook.register(
    'routes-init',
    observer,
    Reactium.Enums.priority.highest,
);

Reactium.Component.register('Blueprint', Blueprint);
