/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin HookComponent
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('ComponentManagerHookComponent').then(() => {
    Reactium.Component.register('ComponentManagerHookComponent', Component);
});
