const path = require('path');
const fs = require('fs-extra');
const op = require('object-path');

module.exports = ({ params, props }) => {
    const { cwd } = props;
    const { app, auth, server } = params;

    const configPath = path.normalize(cwd + '/.cli/config.json');

    if (!fs.existsSync(configPath)) {
        fs.ensureFileSync(configPath);
        fs.writeFileSync(configPath, '{}', 'utf8');
    }

    const config = require(configPath);

    op.set(config, 'parse.app', app);
    op.set(config, 'parse.auth', auth);
    op.set(config, 'parse.server', server);

    fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');

    return { ...props.config, ...config };
};
