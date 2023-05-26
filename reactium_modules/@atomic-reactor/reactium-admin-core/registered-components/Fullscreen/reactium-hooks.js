import Widget from './Widget';
import Fullscreen from './sdk';
import Reactium, { __ } from '@atomic-reactor/reactium-core/sdk';

Reactium.Plugin.register('Fullscreen').then(() => {
    Reactium.Utils.Fullscreen = new Fullscreen();
    Reactium.Component.register('FullscreenWidget', Widget);

    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-FULLSCREEN-WIDGET',
        component: Widget,
        order: Reactium.Enums.priority.lowest - 10,
        zone: ['admin-content-toolbar-top'],
        'data-align': 'left',
        'data-tooltip': __('Fullscreen'),
        'data-vertical-align': 'middle',
    });
});
