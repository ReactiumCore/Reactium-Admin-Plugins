const { development } = require('./reactium-hooks.json');
const Reactium = require('@atomic-reactor/reactium-sdk-core').default;

if (development) {
    Reactium.Hook.register(
        'Server.AppStyleSheets',
        async (req, AppStyleSheets) => {
            AppStyleSheets.register('my-stylesheet', {
                path: '/assets/style/shortcodes.css',
            });
        },
    );
}
