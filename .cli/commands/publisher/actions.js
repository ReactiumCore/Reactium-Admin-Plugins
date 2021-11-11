const copy = require('clipboardy');
const pkg = require('../../../package');

const { chalk, fs, op, path } = arcli;

const normalize = (...p) => path.normalize(path.join(process.cwd(), ...p));

const dest = (...p) => normalize('reactium_modules', '@atomic-reactor', ...p);

const jsonColorize = json =>
    String(json)
        .replace(/\"(.*?)\"(:)/gm, `${chalk.cyan('"$1"')}${chalk.white(':')}`)
        .replace(/\s\"(.*?)\"/gm, ` ${chalk.magenta('"$1"')}`);

const pkgTmp = {
    name: '@atomic-reactor/reactium-admin-content',
    version: '1.0.0',
    description: 'Reactium Admin plugin',
    main: 'index.js',
    scripts: {
        test: 'echo "Error: no test specified" && exit 1',
    },
    keywords: ['reactium', 'admin'],
    author: 'Reactium LLC',
    license: 'MIT',
};

let mem = {
    directories: [],
    plugins: [],
};

module.exports = () => ({
    init: () => {
        console.log('');
        console.log(`Publishing ${chalk.magenta('Reactium Admin')} plugins...`);
    },
    directories: ({ params }) => {
        mem.plugins = Array.from(params.plugins);
        mem.directories = mem.plugins.map(dir => dest(dir));
    },
    publish: async ({ params }) => {
        const ver = op.get(params, 'ver', 'patch');
        const dirs = Array.from(mem.directories).filter(dir => {
            return !String(path.basename(dir)).startsWith('.');
        });

        while (dirs.length > 0) {
            const dir = dirs.shift();
            try {
                await arcli.runCommand(
                    'arcli',
                    ['publish', '-p', 'n', '--ver', ver],
                    { cwd: dir },
                );
            } catch (err) {
                console.log(err);
            }
        }
    },
});
