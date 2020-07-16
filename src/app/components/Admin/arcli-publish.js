const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const op = require('object-path');

const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const prefix = require('gulp-autoprefixer');
const tildeImporter = require('node-sass-tilde-importer');
const jsonFunctions = require('node-sass-functions-json').default;

module.exports = spinner => {
    let cwd;
    const message = (...text) => (spinner.text = text.join(' '));
    const normalize = (...args) => path.normalize(path.join(...args));

    const nodeModulesDir = dir => {
        const dirs = normalize(dir).split(path.sep);
        while (dirs.length > 0) {
            const d = normalize(dirs.join(path.sep), 'node_modules');
            if (fs.existsSync(d)) {
                return path.relative(dir, d);
            }

            dirs.pop();
        }
    };

    return {
        init: ({ props }) => {
            cwd = op.get(props, 'cwd');
        },
        compileCSS: async () => {
            const src = '**/admin-plugin.scss';
            const dest = normalize(cwd, 'static', 'assets', 'style');

            message('Generating', chalk.cyan('admin-plugin.css'));

            const node_modules = nodeModulesDir(cwd);

            const styles = () => {
                return gulp
                    .src(src)
                    .pipe(
                        sass({
                            functions: jsonFunctions,
                            importer: tildeImporter,
                            includePaths: [node_modules],
                        }),
                    )
                    .pipe(prefix('last 1 version'))
                    .pipe(cleanCSS())
                    .pipe(rename({ dirname: '' }))
                    .pipe(gulp.dest(dest));
            };

            // first to register
            gulp.task('styles', styles);

            // second to run
            await gulp.task('styles')();

            // Wait awhile before exiting the function to ensure the gulp task completes
            return new Promise(resolve => setTimeout(resolve, 10000));
        },
        complete: () => {
            spinner.stopAndPersist({
                text: `Generated ${chalk.cyan('admin.css')} file`,
                symbol: chalk.green('✔'),
            });
            console.log('');
            return new Promise(resolve => setTimeout(resolve, 1000));
        },
    };
};
