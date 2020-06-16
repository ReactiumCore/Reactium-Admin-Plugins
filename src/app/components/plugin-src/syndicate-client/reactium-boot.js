const SDK = require('@atomic-reactor/reactium-sdk-core').default;
const { development } = require('./reactium-hooks.json');

// For local development only
if (development) {
    SDK.Server.AppStyleSheets.register('syndicate-client-plugin', {
        path: '/assets/style/syndicate-client-plugin.css',
        order: SDK.Enums.priority.normal,
    });
}
