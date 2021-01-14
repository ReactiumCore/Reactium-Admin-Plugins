const Reactium = require('reactium-core/sdk').default;
const Enums = Reactium.Enums;
const { forceSSL } = require('./middlewares/forceSSL');
const proxy = require('http-proxy-middleware');
const op = require('object-path');
const _ = require('underscore');
const fs = require('fs');
const path = require('path');

const isSrc = () => {
    const d = path.normalize(
        path.join(process.cwd(), 'src', 'app', 'components', 'Admin', 'static'),
    );

    if (fs.existsSync(d)) return d;
};

Reactium.Server.Middleware.register('media-proxy', {
    name: 'media-proxy',
    use: (req, res, next) => {
        if (!global.restAPI) {
            next();
            return;
        }

        return proxy('/media', {
            target: restAPI.replace(/\/api$/, ''),
            changeOrigin: true,
            logLevel: process.env.DEBUG === 'on' ? 'debug' : 'error',
            ws: false,
        })(req, res, next);
    },
    order: Enums.priority.highest,
});

Reactium.Server.Middleware.register('forceSSL', {
    name: 'forceSSL',
    use: forceSSL,
    order: Enums.priority.highest,
});

Reactium.Hook.register('Server.beforeApp', async (req, Server) => {
    try {
        const { plugins } = await Reactium.Cloud.run('plugins');
        req.plugins = global.plugins = plugins;
        Server.AppGlobals.register('plugins', {
            value: plugins,
            order: Enums.priority.highest,
        });
    } catch (error) {
        console.error('Unable to load plugins list', error);
    }
});

Reactium.Hook.registerSync(
    'Server.AppScripts',
    (req, AppScripts) => {
        _.sortBy(op.get(req, 'plugins', []), 'order').forEach(plugin => {
            const script = op.get(plugin, 'meta.assets.admin.script');
            AppScripts.unregister(plugin.ID);
            if (script && plugin.active) {
                const url = !/^http/.test(script) ? '/api' + script : script;
                AppScripts.register(plugin.ID, {
                    path: url,
                    order: Enums.priority.high,
                });
            }
        });
    },
    Enums.priority.highest,
);

Reactium.Hook.registerSync(
    'Server.AppStyleSheets',
    (req, AppStyleSheets) => {
        _.sortBy(op.get(req, 'plugins', []), 'order').forEach(plugin => {
            const style = op.get(plugin, 'meta.assets.admin.style');
            AppStyleSheets.unregister(plugin.ID);
            if (style && plugin.active) {
                const url = !/^http/.test(style) ? '/api' + style : style;
                AppStyleSheets.register(plugin.ID, {
                    path: url,
                    order: Enums.priority.high,
                });
            }
        });
    },
    Enums.priority.highest,
);

Reactium.Hook.registerSync(
    'Server.AppStyleSheets.includes',
    includes => {
        if (!includes.includes('admin.css') && isSrc()) {
            includes.push('admin.css');
        }
    },
    Enums.priority.highest,
);

Reactium.Hook.registerSync(
    'Server.AppStyleSheets.excludes',
    excludes => {
        if (!excludes.includes('style.css') && isSrc()) {
            excludes.push('style.css');
        }
    },
    Enums.priority.highest,
);
