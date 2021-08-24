import Reactium from 'reactium-core/sdk';
import { SidebarButton } from './index';

Reactium.Plugin.register('BlockContent').then(() => {
    Reactium.RTE.Button.register('contentComponent', {
        order: 60,
        sidebar: true,
        button: SidebarButton,
    });
});
