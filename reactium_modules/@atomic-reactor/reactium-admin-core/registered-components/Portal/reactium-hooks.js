import Portal from '.';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('Portal').then(() => {
    Reactium.Component.register('Portal', Portal);
});
