import Reactium from '@atomic-reactor/reactium-sdk-core';

const ReactiumUI = require('./index');
const priority = Reactium.Enums.priority.lowest;

Reactium.Plugin.register('ReactiumUI', priority).then(() => {
    Reactium.Component.register('ReactiumUI', ReactiumUI);
    Reactium.Hook.register('app-ready', () => {
        Reactium.Hook.runSync('reactium-ui', ReactiumUI);
    });
});
