const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const _ = require('underscore');
const globby = require('globby');
const op = require('object-path');
const mod = path.dirname(require.main.filename);
const pad = require(`${mod}/lib/pad`);

module.exports = spinner => {
    const message = (...text) => {
        if (spinner) spinner.text = text.join(' ');
    };

    const normalize = (...args) => path.normalize(path.join(...args));

    let cwd, append, insert, pluginDirectory, prompt, scss, stylePaths, styles;
    return {
        init: async ({ params, props }) => {
            cwd = op.get(props, 'cwd');
            pluginDirectory = op.get(
                params,
                'pluginDirectory',
                normalize(cwd, 'src', 'app', 'components', 'Admin'),
            );

            prompt = op.get(props, 'prompt');
            scss = normalize(pluginDirectory, 'style', '_admin.scss');
            styles = await globby([`${cwd}/src/**/*.scss`]);
            styles = styles.filter(
                file => String(path.basename(file)).substr(0, 1) !== '_',
            );

            append = op.get(params, 'append');

            message('Searching for', chalk.cyan('.scss'), 'files...');

            spinner.stop();
        },
        updateSCSS: ({ params }) => {
            let content = fs.readFileSync(scss, 'utf-8');
            let replacement = String(
                path.relative(
                    path.resolve(scss),
                    path.resolve(normalize(cwd, 'node_modules')),
                ),
            );
            replacement = replacement.split('../');
            replacement.shift();
            replacement = replacement.join('../') + '/';

            content = String(content).replace(
                '../../../../../node_modules/',
                replacement,
            );

            if (!op.get(params, 'pluginDirectory')) return;
            fs.writeFileSync(scss, content);
        },
        prompt: ({ params }) => {
            const unattended = op.get(params, 'unattended');
            if (unattended === true) return;

            if (styles.length < 1) return;
            if (styles.length === 1) {
                stylePaths = styles;
                return;
            }

            const padLen = String(styles.length).length;
            const styleList = styles
                .map((file, index) => {
                    index += 1;
                    let i = chalk.cyan(pad(index, padLen) + '.');
                    return `\n\t    ${i} ${chalk.white(file)}`;
                })
                .join('');

            return new Promise((resolve, reject) => {
                prompt.override = { append };
                prompt.get(
                    [
                        {
                            name: 'insert',
                            before: val =>
                                String(val)
                                    .substr(0, 1)
                                    .toUpperCase() === 'Y',
                            default: 'Y',
                            description: `${chalk.white(
                                'Import Admin styles?',
                            )} ${chalk.cyan('(Y/N):')}`,
                            message: ' ',
                            pattern: /^y|n|Y|N/,
                            required: true,
                            type: 'string',
                        },
                        {
                            name: 'inject',
                            pattern: /[0-9\s]/,
                            description: `${chalk.white(
                                'Import Admin styles into:',
                            )} ${styleList}\n    ${chalk.cyan('Select:')}`,
                            required: true,
                            message:
                                'Select a number or list of numbers. Example: 1 2 3',
                            ask: () => prompt.history('insert').value === true,
                            before: val =>
                                String(val)
                                    .replace(/[^0-9\s]/g, '')
                                    .replace(/\s\s+/g, ' ')
                                    .trim()
                                    .split(' ')
                                    .map(
                                        v =>
                                            styles[
                                                Number(
                                                    String(v).replace(
                                                        /[^0-9]/gi,
                                                    ),
                                                ) - 1
                                            ],
                                    ),
                        },
                        {
                            name: 'append',
                            ask: () => prompt.history('insert').value === true,
                            before: val =>
                                String(val)
                                    .substr(0, 1)
                                    .toUpperCase() === 'Y',
                            default: 'N',
                            description: `${chalk.white(
                                'Import Admin styles at the end of the file?',
                            )} ${chalk.cyan('(Y/N):')}`,
                            message: ' ',
                            pattern: /^y|n|Y|N/,
                            required: true,
                            type: 'string',
                        },
                    ],
                    (err, input) => {
                        if (err) process.exit();

                        stylePaths = op.get(input, 'inject');
                        append = op.get(input, 'append');
                        insert = op.get(input, 'insert');

                        resolve();
                    },
                );
            });
        },
        inject: ({ params, props }) => {
            if (!insert) return;

            const getPath = (filepath, scss) =>
                String(path.relative(filepath, scss))
                    .replace(/^\..\//, '')
                    .replace('_admin.scss', 'admin');

            stylePaths.forEach(filepath => {
                const importPath = `@import '${getPath(filepath, scss)}';`;

                let fileContent = String(fs.readFileSync(filepath, 'utf-8'));
                fileContent = fileContent
                    .split(importPath)
                    .join('')
                    .replace(/\s\s+/g, '\n');
                fileContent =
                    append === true
                        ? `${fileContent}\n${importPath}`
                        : `${importPath}\n${fileContent}`;

                fs.writeFileSync(filepath, fileContent);
            });
        },
        complete: () => console.log(''),
    };
};