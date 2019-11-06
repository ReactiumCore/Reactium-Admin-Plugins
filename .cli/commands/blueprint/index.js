/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */

const path = require('path');
const chalk = require('chalk');
const _ = require('underscore');
const op = require('object-path');
const prettier = require('prettier');
const generator = require('./generator');
const mod = path.dirname(require.main.filename);
const { message } = require(`${mod}/lib/messenger`);

const parsePrompt = require(path.normalize(
    process.cwd() + '/.cli/utils/parse-prompt',
));

/**
 * NAME String
 * @description Constant defined as the command name. Value passed to the commander.command() function.
 * @example $ arcli blueprint
 * @see https://www.npmjs.com/package/commander#command-specific-options
 * @since 2.0.0
 */
const NAME = 'blueprint';

/**
 * DESC String
 * @description Constant defined as the command description. Value passed to
 * the commander.desc() function. This string is also used in the --help flag output.
 * @see https://www.npmjs.com/package/commander#automated---help
 * @since 2.0.0
 */
const DESC = 'Created a new Blueprint object.';

/**
 * CANCELED String
 * @description Message sent when the command is canceled
 * @since 2.0.0
 */
const CANCELED = 'Blueprint canceled!';

/**
 * confirm({ props:Object, params:Object }) Function
 * @description Prompts the user to confirm the operation
 * @since 2.0.0
 */
const CONFIRM = ({ props, params, msg }) => {
    const { prompt } = props;

    msg = msg || chalk.white('Proceed?');

    return new Promise((resolve, reject) => {
        prompt.get(
            {
                properties: {
                    confirmed: {
                        description: `${msg} ${chalk.cyan('(Y/N):')}`,
                        type: 'string',
                        required: true,
                        pattern: /^y|n|Y|N/,
                        message: ` `,
                        before: val => {
                            return String(val).toUpperCase() === 'Y';
                        },
                    },
                },
            },
            (error, input = {}) => {
                const confirmed = error
                    ? false
                    : op.get(input, 'confirmed', false);
                if (confirmed === false) {
                    reject(error);
                } else {
                    op.set(params, 'confirmed', true);
                    resolve(params);
                }
            },
        );
    });
};

/**
 * conform(input:Object) Function
 * @description Reduces the input object.
 * @param input Object The key value pairs to reduce.
 * @since 2.0.0
 */
const CONFORM = ({ input, props }) =>
    Object.keys(input)
        .sort()
        .reduce((obj, key) => {
            let val = input[key];
            switch (key) {
                case 'zones':
                case 'capabilities':
                    val = String(val)
                        .replace(' ', '')
                        .split(',');
                    obj[key] = _.compact(val);
                    break;

                default:
                    obj[key] = val;
                    break;
            }
            return obj;
        }, {});

/**
 * HELP Function
 * @description Function called in the commander.on('--help', callback) callback.
 * @see https://www.npmjs.com/package/commander#automated---help
 * @since 2.0.0
 */
const HELP = () =>
    console.log(`
Example:
  $ arcli blueprint -h
`);

/**
 * FLAGS
 * @description Array of flags passed from the commander options.
 * @since 2.0.18
 */
const FLAGS = [
    'auth',
    'capabilities',
    'overwrite',
    'server',
    'app',
    'name',
    'zones',
    'header',
    'sidebar',
    'masterKey',
    'route',
    'description',
];

/**
 * FLAGS_TO_PARAMS Function
 * @description Create an object used by the prompt.override property.
 * @since 2.0.18
 */
const FLAGS_TO_PARAMS = ({ opt = {} }) =>
    FLAGS.reduce((obj, key) => {
        let val = opt[key];
        val = typeof val === 'function' ? undefined : val;

        if (val) {
            obj[key] = val;
        }

        return obj;
    }, {});

/**
 * PREFLIGHT Function
 */
const PREFLIGHT = ({ msg, params, props }) => {
    msg = msg || 'Preflight checklist:';

    message(msg);

    // Transform the preflight object instead of the params object
    const preflight = { ...params };

    console.log(
        prettier.format(JSON.stringify(preflight), {
            parser: 'json-stringify',
        }),
    );
};

/**
 * SCHEMA Function
 * @description used to describe the input for the prompt function.
 * @see https://www.npmjs.com/package/prompt
 * @since 2.0.0
 */

const SCHEMA = ({ props }) => ({
    properties: {
        name: {
            description: chalk.white('Blueprint name:'),
            message: 'Blueprint name is required',
            required: true,
        },
        description: {
            description: chalk.white('Blueprint description:'),
        },
        zones: {
            description: chalk.white('Content Zones:'),
            default: 'content',
        },
        route: {
            description: chalk.white('Route:'),
        },
        capabilities: {
            description: chalk.white('Route Capabilities:'),
        },
    },
});

const APP = props => op.get(props, 'config.parse.app');
const AUTH = props => op.get(props, 'config.parse.auth');
const SERVER = (props, defaultValue) =>
    op.get(props, 'config.parse.server', defaultValue);

/**
 * ACTION Function
 * @description Function used as the commander.action() callback.
 * @see https://www.npmjs.com/package/commander
 * @param opt Object The commander options passed into the function.
 * @param props Object The CLI props passed from the calling class `orcli.js`.
 * @since 2.0.0
 */
const ACTION = async ({ opt, props }) => {
    const { cwd, prompt } = props;
    let ovr = FLAGS_TO_PARAMS({ opt });

    op.set(ovr, 'app', op.get(ovr, 'app', APP(props)));
    op.set(ovr, 'auth', op.get(ovr, 'auth', AUTH(props)));
    op.set(ovr, 'server', op.get(ovr, 'server', SERVER(props)));

    ovr = await parsePrompt({
        override: ovr,
        options: opt,
        props,
        prompt,
        CANCELED,
    });

    prompt.override = ovr;
    prompt.start();

    return new Promise((resolve, reject) => {
        prompt.get(SCHEMA({ props, override: ovr }), (err, input = {}) => {
            if (err) {
                prompt.stop();
                reject(op.get(err, 'message', CANCELED));
                return;
            }

            input = { ...ovr, ...input };
            const params = CONFORM({ input, props });

            PREFLIGHT({
                msg:
                    'A new blueprint will be created with the following options:',
                params,
                props,
            });

            resolve(params);
        });
    })
        .then(params => {
            return CONFIRM({ props, params });
        })
        .then(params => {
            console.log('');
            return generator({ params, props });
        })
        .then(results => {
            console.log('');
        })
        .catch(err => {
            prompt.stop();
            message(op.get(err, 'message', CANCELED));
        });
};

/**
 * COMMAND Function
 * @description Function that executes program.command()
 */
const COMMAND = ({ program, props }) =>
    program
        .command(NAME)
        .description(DESC)
        .action(opt => ACTION({ opt, props }))
        .option('-a, --auth [auth]', 'Parse session token.')
        .option(
            '-b, --builtIn [builtIn]',
            'Persist the blueprint by making it a built in.',
        )
        .option('-o, --overwrite [overwrite]', 'Overwrite existing blueprint.')
        .option('-m, --masterKey [masterKey]', 'Parse masterKey.')
        .option('-n, --name [name]', 'Unique blueprint name.')
        .option('-d, --description [description]', 'Blueprint description.')
        .option('-r, --route [route]', 'Route associated with the blueprint.')
        .option(
            '-c, --capabilities [capabilities]',
            'Capabilities associated with the route.',
        )
        .option('-s, --server [server]', 'Parse server url.')
        .option('-z, --zones [zones]', 'Blueprint zones.')
        .option('-A, --app [app]', 'Parse app ID.')
        .option('--no-header', 'Exclude the header zone')
        .option('--no-sidebar', 'Exclude the sidebar zone')
        .on('--help', HELP);

/**
 * Module Constructor
 * @description Internal constructor of the module that is being exported.
 * @param program Class Commander.program reference.
 * @param props Object The CLI props passed from the calling class `arcli.js`.
 * @since 2.0.0
 */
module.exports = {
    COMMAND,
    NAME,
};
