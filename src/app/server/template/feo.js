import serialize from 'serialize-javascript';

module.exports = {
    version: '3.0.20',
    includeSheets: [
        'admin.css',
        // uncomment to test locally
        // 'reset-plugin.css',
    ],
    template: req => {
        return `<!DOCTYPE html>
        <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                ${req.styles}
                ${req.pluginAssets.styles}
            </head>
            <body>
                <Component type="DevTools"></Component>
                <div id="router"></div>

                <script>
                    window.ssr = false;
                    window.defines = ${serialize(defines)};
                    window.restAPI = '/api';
                    window.parseAppId = '${parseAppId}';
                    window.settings = ${serialize(req.settings)};
                    window.blueprints = ${serialize(req.blueprints)};
                    window.routesConfig = ${serialize(req.routesConfig)};
                    window.routes = ${serialize(req.routes)};
                    window.plugins = ${serialize(req.plugins)};
                </script>
                ${req.scripts}
                ${req.pluginAssets.scripts}
            </body>
        </html>`;
    },
};
