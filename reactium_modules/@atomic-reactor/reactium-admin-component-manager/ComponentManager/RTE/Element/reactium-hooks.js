/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Element
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('Element-plugin').then(() => {
    Reactium.Component.register('Element', Component);
});
