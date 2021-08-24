/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Type
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('ComponentManagerTypeEditor').then(() => {
    Reactium.Component.register('ComponentManagerTypeEditor', Component);
});
