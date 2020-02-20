import Component from '.';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('Logo', Reactium.Enums.priority.highest).then(() => {
    Reactium.Component.register('Logo', Component);
});
