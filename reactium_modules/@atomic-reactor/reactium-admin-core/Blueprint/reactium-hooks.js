import Reactium from 'reactium-core/sdk';
import op from 'object-path';
import SDK from './sdk';
import Blueprint from './index';

const routingStateHandler = async updates => {
    if (op.get(updates, 'transitionState') === 'LOADING') {
        const route = op.get(updates, 'active.match.route');
        const meta = op.get(route, 'meta', {});

        // load content
        if (op.has(meta, 'contentUUID')) {
            const type = op.get(meta, 'type');
            const contentUUID = op.get(meta, 'contentUUID');

            try {
                await Reactium.Content.fetch(type, contentUUID);

                Reactium.Routing.nextState();
            } catch (error) {
                // TODO: DO SOMETHING ABOUT IT! Error route?
                console.log(
                    `Can't load content of type ${type} and uuid ${contentUUID}`,
                    error,
                );
            }
        }
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
