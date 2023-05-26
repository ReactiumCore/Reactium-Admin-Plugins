import AlertBox from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

Reactium.Plugin.register('AlertBox').then(() => {
    Reactium.Component.register('AlertBox', AlertBox);
});
