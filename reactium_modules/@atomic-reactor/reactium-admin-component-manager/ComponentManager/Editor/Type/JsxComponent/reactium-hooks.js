/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin JsxComponent
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';

Reactium.Plugin.register('ComponentManagerJsxComponent').then(() => {
    Reactium.Component.register('ComponentManagerJsxComponent', Component);
});
