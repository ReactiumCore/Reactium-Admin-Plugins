/**
 * -----------------------------------------------------------------------------
 * Plugin: Dashboard WelcomeWidget
 * -----------------------------------------------------------------------------
 */

import Widget from './index';
import Reactium from '@atomic-reactor/reactium-core/sdk';

const WIDGET_ID = 'DASHBOARD_WELCOME_WIDGET';
Reactium.Plugin.register(WIDGET_ID).then(() => {
    Reactium.Dashboard.register(WIDGET_ID, {
        component: Widget,
        order: Reactium.Enums.priority.lowest,
    });
});
