import Tools from './index';
import Hotkeys from './Hotkeys';
import Reactium from 'reactium-core/sdk';

Reactium.Component.register('Tools', Tools);
Reactium.Plugin.register('AdminTools').then(() => {
    // Extend sdk
    Reactium.Hotkeys = Reactium.Hotkeys || new Hotkeys();
});
