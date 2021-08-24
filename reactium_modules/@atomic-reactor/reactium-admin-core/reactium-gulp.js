const gulp = require('gulp');
const sass = require('gulp-sass')(require('node-sass'));
const reactiumImporter = require('@atomic-reactor/node-sass-reactium-importer');
const jsonFunctions = require('node-sass-functions-json').default;
const sourcemaps = require('gulp-sourcemaps');
const gulpif = require('gulp-if');
const cleanCSS = require('gulp-clean-css');
const prefix = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';
const browserSync = require('browser-sync');

/**
 * TODO: This replaces the dart-sass compile with node-sass until Reactium-UI has
 * been updated in the Admin plugin.
 */
ReactiumGulp.Hook.registerSync('tasks', (GulpRegistry, config) => {
    GulpRegistry.unregister('styles:compile');

    const compileStyles = () => {
        return gulp
            .src(config.src.style)
            .pipe(gulpif(isDev, sourcemaps.init()))
            .pipe(
                sass({
                    functions: Object.assign({}, jsonFunctions),
                    importer: reactiumImporter,
                    includePaths: config.src.includes,
                }).on('error', sass.logError),
            )
            .pipe(prefix(config.browsers))
            .pipe(gulpif(!isDev, cleanCSS()))
            .pipe(gulpif(isDev, sourcemaps.write()))
            .pipe(rename({ dirname: '' }))
            .pipe(gulp.dest(config.dest.style))
            .pipe(gulpif(isDev, browserSync.stream()));
    };

    GulpRegistry.register('styles:compile', {
        task: compileStyles,
        order: 100,
    });
});
