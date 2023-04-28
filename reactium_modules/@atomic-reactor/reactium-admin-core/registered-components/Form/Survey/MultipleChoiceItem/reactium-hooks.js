/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin MultipleChoice
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';

(async () => {
    await Reactium.Plugin.register('MultipleChoice');
    Reactium.Component.register('MultipleChoice', Component);
})();
