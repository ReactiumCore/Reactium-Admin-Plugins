/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Selector
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('ComponentManagerTypeSelector').then(() => {
    Reactium.Component.register('ComponentManagerTypeSelector', Component);
});
