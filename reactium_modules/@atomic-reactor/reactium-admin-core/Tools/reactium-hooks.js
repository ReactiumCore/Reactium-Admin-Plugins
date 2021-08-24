import Tools from './index';
import Hotkeys from './Hotkeys';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('AdminTools').then(() => {
    // Extend sdk
    Reactium.Hotkeys = Reactium.Hotkeys || new Hotkeys();

    Reactium.Zone.addComponent({
        id: 'ADMIN-TOOLS',
        component: Tools,
        zone: ['admin-tools'],
        order: Reactium.Enums.priority.highest,
    });
});
