const actions = require('./actions');

const { _, ActionSequence, chalk, fs, op, path } = arcli;

const X = chalk.red('✖');
const CHK = chalk.green('✓');

const message = (...msg) => {
    console.log('');
    console.log(...msg);
    console.log('');
};

const error = (...err) => message(chalk.red('Error:'), ...err);

const exit = (...msg) => {
    message(...msg);
    process.exit();
};

const normalize = (...p) => path.normalize(path.join(process.cwd(), ...p));

const dest = (...p) => normalize('reactium_modules', '@atomic-reactor', ...p);

const plugins = () => fs.readdirSync(dest());

const NAME = 'publisher';

const DESC = 'Publish Reactium Admin plugins';

// prettier-ignore
const CANCELED = ` ${X} ${chalk.magenta(NAME)} ${chalk.cyan('canceled!')}`;

const PROMPT = {
    CONFIG: async (props, params) => {
        const exclusive = Array.from(op.get(params, 'include', [])).length > 0;

        const { exclude, include, update, ver } = await props.inquirer.prompt(
            [
                {
                    loop: false,
                    name: 'ver',
                    type: 'list',
                    default: 'patch',
                    prefix: props.prefix,
                    message: 'Version bump:',
                    when: () => !op.get(params, 'ver'),
                    choices: ['patch', 'minor', 'major'],
                },
                {
                    loop: false,
                    name: 'exclude',
                    type: 'checkbox',
                    default: op.get(params, 'exclude', []),
                    prefix: props.prefix,
                    message: 'Exclude:  ',
                    when: () => !exclusive,
                    choices: props.plugins.filter(
                        p => !String(p).startsWith('.'),
                    ),
                    askAnswered: !exclusive,
                },
            ],
            params,
        );

        params.ver = ver;
        params.update = update;
        params.exclude = exclude;
        params.include = include;
    },
    CONFIRM: async (props, params) => {
        const { confirm } = await props.inquirer.prompt(
            [
                {
                    default: false,
                    name: 'confirm',
                    type: 'confirm',
                    prefix: props.prefix,
                    message: 'Proceed?:',
                },
            ],
            params,
        );

        params.confirm = confirm;
    },
};

const CONFORM = ({ params, props }) => {
    let newParams = Object.keys(params).reduce((obj, key) => {
        let val = params[key];
        switch (key) {
            default:
                obj[key] = val;
                break;
        }
        return obj;
    }, {});

    const { exclude = [], include = [] } = newParams;
    if (include.length > 0) {
        op.set(newParams, 'exclude', []);
    }

    newParams.exclude = exclude;
    newParams.include = include;
    newParams.plugins = props.plugins;

    if (newParams.include.length > 0) {
        newParams.plugins = _.intersection(
            newParams.plugins,
            newParams.include,
        );
    }

    if (newParams.exclude.length > 0) {
        newParams.plugins = _.without(newParams.plugins, ...newParams.exclude);
    }

    return newParams;
};

// prettier-ignore
const HELP = () => console.log(`
Examples:
  $ ${chalk.white('arcli')} ${chalk.magenta(NAME)} ${chalk.cyan('--ver')} patch ${chalk.cyan('--include')} "reactium-admin-content, reactium-admin-shortcuts"
  $ ${chalk.white('arcli')} ${chalk.magenta(NAME)} ${chalk.cyan('--ver')} minor ${chalk.cyan('--exclude')} "reactium-admin-content, reactium-admin-shortcuts"
  $ ${chalk.white('arcli')} ${chalk.magenta(NAME)} ${chalk.cyan('--ver')} major
`);

const ACTION = async ({ opt, props }) => {
    console.log('');

    props.error = error;
    props.message = message;
    props.plugins = plugins();
    props.prefix = chalk.cyan(props.config.prompt.prefix);

    let params = FLAGS_TO_PARAMS({ opt, props });

    await PROMPT.CONFIG(props, params);

    await PROMPT.CONFIRM(props, params);

    params = CONFORM({ params, props });

    if (!params.confirm) exit(CANCELED);

    const [errors, success] = await ActionSequence({
        actions: actions(),
        options: { params, props },
    })
        .then(success => [null, success])
        .catch(error => [error]);

    if (!success && errors) {
        error(X, errors);
    } else {
        message(CHK, chalk.magenta(name), 'complete!');
    }

    process.exit();
};

const FLAGS = {
    ver: {
        flag: '--ver [ver]',
        desc: 'Version bump type',
    },
    exclude: {
        flag: '-e, --exclude [exclude]',
        desc: 'Exclude specific plugins',
    },
    include: {
        flag: '-i, --include [include]',
        desc: 'Publish specific plugins only',
    },
};

const FLAGS_TO_PARAMS = ({ opt = {}, props }) =>
    Object.keys(FLAGS).reduce((obj, key) => {
        let val = opt[key];
        val = typeof val === 'function' ? undefined : val;

        switch (key) {
            case 'exclude':
            case 'include':
                if (val) {
                    // prettier-ignore
                    obj[key] = _.chain(String(val).replace(/\s/g, '').split(','))
                    .compact()
                    .intersection(props.plugins)
                    .value();
                }
                break;

            default:
                obj[key] = val;
        }

        return obj;
    }, {});

const COMMAND = ({ program, props }) =>
    program
        .command(NAME)
        .description(DESC)
        .action(opt => ACTION({ opt, props }))
        .option(FLAGS.ver.flag, FLAGS.ver.desc)
        .option(FLAGS.exclude.flag, FLAGS.exclude.desc)
        .option(FLAGS.include.flag, FLAGS.include.desc)
        .on('--help', HELP);

module.exports = {
    COMMAND,
    NAME,
};
