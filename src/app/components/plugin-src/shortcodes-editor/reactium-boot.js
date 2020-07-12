const { development } = require('./reactium-hooks.json');
const Reactium = require('@atomic-reactor/reactium-sdk-core').default;

if (development) {
    Reactium.Server.AppStyleSheets.register('shortcodes', {
        path: '/assets/style/shortcodes.css',
        order: 1000,
    });
}
