const ora = require('ora');
const path = require('path');
const op = require('object-path');
const Parse = require('parse/node');
const parseInit = require(path.normalize(
    process.cwd() + '/.cli/utils/parse-init',
));

module.exports = async (override = {}) => {
    const { app, server, auth } = override;

    if (!app || !server || !auth) {
        return override;
    }

    const spinner = ora({
        spinner: 'dots',
        color: 'cyan',
        text: 'Validating auth...',
    });

    spinner.start();

    parseInit({ params: override, Parse });

    try {
        const { valid = false } = await Parse.Cloud.run(
            'session-validate',
            {},
            { sessionToken: auth },
        );

        if (valid !== true) {
            spinner.fail('Invalid session token');
            op.del(override, 'auth');
        } else {
            spinner.succeed('Authenticated!');
        }
    } catch (err) {
        spinner.fail('Invalid session token');
        op.del(override, 'auth');
    }

    console.log('');

    return override;
};
