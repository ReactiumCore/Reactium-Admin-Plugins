const SDK = require('@atomic-reactor/reactium-sdk-core').default;
SDK.Hook.registerSync('Server.AppStyleSheets', (req, AppStyleSheets) => {
    AppStyleSheets.register('admin-plugin', {
        path: '/assets/style/admin-plugin.css',
        order: SDK.Enums.priority.normal,
        when: req => {
            if (String(req.originalUrl).startsWith('/admin')) return true;
            if (String(req.originalUrl).startsWith('/login')) return true;
            if (String(req.originalUrl).startsWith('/logout')) return true;
            return false;
        },
    });
});
