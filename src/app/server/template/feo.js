import serialize from 'serialize-javascript';

module.exports = {
    version: '3.2.0',
    template: req => {
        return `<!DOCTYPE html>
        <html>
            <head>
                <link rel="shortcut icon" type="image/x-icon" href="/assets/images/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <meta charSet='utf-8' />
                ${req.styles}
            </head>
            <body>
                ${req.headerScripts}
                ${req.appBindings}

                <script>
                    window.ssr = false;
                    window.defines = ${serialize(defines)};
                    window.restAPI = '/api';
                    window.actiniumAppId = '${actiniumAppId}';
                    ${req.appGlobals}
                </script>
                ${req.scripts}
                ${req.appAfterScripts}
            </body>
        </html>`;
    },
};
