import _ from 'underscore';
import moment from 'moment';
import Reactium from 'reactium-core/sdk';

Reactium.Hook.register('init', async () => {
    if (typeof window !== 'undefined') {
        const session = Reactium.User.getSessionToken();

        if (window.settings && Object.keys(window.settings).length) {
            Reactium.Cache.set('settings.loaded', [
                moment().format('HH:mm:ss'),
                Reactium.Enums.cache.settings,
                Reactium.Setting.load,
            ]);

            Object.entries(window.settings).forEach(([key, value]) => {
                Reactium.Cache.set(
                    _.compact(['setting', key, 'session', session]),
                    value,
                    Reactium.Enums.cache.settings,
                );
            });
            delete window.settings;
        } else {
            await Reactium.Setting.load();
        }
    }
});

const settingsPlugin = async () => {
    await Reactium.Plugin.register('SETTINGS_PLUGIN');

    await Reactium.Zone.addFilter(
        'settingsCapabilityFilter',
        'settings-groups',
        ({ capabilities = [], strict = false }) =>
            Reactium.User.canSync(capabilities, undefined, strict),
    );
};

settingsPlugin();
