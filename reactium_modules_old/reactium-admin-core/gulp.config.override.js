/**
 * Rename this file to gulp.config.override.js to use it.
 */
module.exports = config => {
    config.dest.colors =
        'reactium_modules/@atomic-reactor/reactium-admin-core/style/_colors.scss';
    return config;
};
