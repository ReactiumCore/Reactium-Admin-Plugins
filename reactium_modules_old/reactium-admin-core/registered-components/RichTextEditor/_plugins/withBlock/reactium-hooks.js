import * as Actions from './Actions';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('withBlockHooks').then(() => {
    Object.entries(Actions).forEach(([id, Component], i) =>
        Reactium.RTE.Action.register(id, {
            order: Component.order || 100 + i * 2,
            zones: Component.zones,
            Component,
        }),
    );
});
