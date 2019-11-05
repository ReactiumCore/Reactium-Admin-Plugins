const path = require('path');
const chalk = require('chalk');
const op = require('object-path');
const terminalLink = require('terminal-link');
const mod = path.dirname(require.main.filename);
const { message } = require(`${mod}/lib/messenger`);

const SCHEMA_SERVER = ({ override, props }) => ({
    properties: {
        server: {
            description: chalk.white('Parse Server URI:'),
            default: 'http://localhost:9000/api',
            required: true,
        },

        app: {
            description: chalk.white('Parse App ID:'),
            default: op.get(props, 'config.parse.app', 'Actinium'),
            required: true,
        },
    },
});

const SCHEMA_AUTH = ({ override, props }) => {
    const url = op.get(override, 'server') + '/cli-auth';
    const link = terminalLink(url, url);

    return {
        properties: {
            auth: {
                description: `${chalk.magenta(
                    'Authentication Required',
                )}${chalk.white('...')}\n\n  ${chalk.white(
                    'To access this command you need a valid session token.\n  Obtain a session token from:\n',
                )}  ${chalk.cyan(link)}\n\n${chalk[
                    props.config.prompt.prefixColor
                ](props.config.prompt.prefix)}${chalk.white('Session Token:')}`,
                required: true,
                message: 'Session Token is required',
            },
        },
    };
};

module.exports = async ({
    override: ovr,
    options: opt,
    props,
    prompt,
    CANCELED,
}) => {
    CANCELED = CANCELED || 'action canceled';
    if (!op.get(ovr, 'server')) {
        try {
            ovr = await new Promise((resolve, reject) => {
                prompt.get(
                    SCHEMA_SERVER({ props, override: ovr }),
                    (err, input = {}) => {
                        if (err) {
                            prompt.stop();
                            if (op.get(err, 'message') === 'canceled') {
                                message(CANCELED);
                            } else {
                                message(op.get(err, 'message', CANCELED));
                            }
                            return reject();
                        }

                        resolve({ ...ovr, ...input });
                    },
                );
            });
        } catch (err) {
            process.exit();
        }
    }

    if (!op.get(ovr, 'auth')) {
        try {
            ovr = await new Promise((resolve, reject) => {
                prompt.get(
                    SCHEMA_AUTH({ props, override: ovr }),
                    (err, input = {}) => {
                        if (err) {
                            prompt.stop();
                            if (op.get(err, 'message') === 'canceled') {
                                message(CANCELED);
                            } else {
                                message(op.get(err, 'message', CANCELED));
                            }
                            reject();
                            return;
                        }

                        resolve({ ...ovr, ...input });
                    },
                );
            });
        } catch (err) {
            process.exit();
        }
    }

    return ovr;
};
