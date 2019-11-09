import Reactium from 'reactium-core/sdk';
import AppSettings from './index';

const appSettingsPlugin = async () => {
    await Reactium.Plugin.register('APP_SETTINGS');

    Reactium.Plugin.addComponent({
        /**
         * Required - used as rendering key. Make this unique.
         * @type {String}
         */
        id: 'APPSETTINGS-PLUGIN',

        /**
         * Component to render. May also be a string, and
         * the component will be looked up in components directory.
         * @type {Component|String}
         */
        component: AppSettings,

        /**
         * One or more zones this component should render.
         * @type {String|Array}
         */
        zone: ['settings-groups'],

        /**
         * By default plugins in zone are rendering in ascending order.
         * @type {Number}
         */
        order: 0,

        capabilities: ['settings.app-get'],
    });
};

appSettingsPlugin();
