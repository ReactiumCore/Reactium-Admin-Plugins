import Portal from '.';
import Reactium from '@atomic-reactor/reactium-core/sdk';

Reactium.Plugin.register('Portal').then(() => {
    Reactium.Component.register('Portal', Portal);
});
