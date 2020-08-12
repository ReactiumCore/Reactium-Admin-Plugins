/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin ContentComponent
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('ComponentManagerContentComponent').then(() => {
    Reactium.Component.register('ComponentManagerContentComponent', Component);
});
