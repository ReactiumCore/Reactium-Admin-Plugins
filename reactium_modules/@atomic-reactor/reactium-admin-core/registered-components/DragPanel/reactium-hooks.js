import Component from '.';
import domain from './domain';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register(domain.name, Reactium.Enums.priority.highest).then(
    () => {
        // Register the UI Component
        Reactium.Component.register(domain.name, Component);
    },
);
