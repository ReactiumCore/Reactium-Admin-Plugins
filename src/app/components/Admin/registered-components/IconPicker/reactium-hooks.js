import Component from '.';
import domain from './domain';
import Reactium from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

Reactium.Plugin.register(domain.name, Reactium.Enums.priority.highest).then(
    async () => {
        // Register the UI Component
        Reactium.Component.register(domain.name, Component);

        // Add icons
        await Reactium.Hook.run('icon-extend', Icon.icons);
    },
);
