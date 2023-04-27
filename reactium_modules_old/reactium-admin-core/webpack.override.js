const op = require('object-path');

/**
 * Passed the current webpack configuration from core
 * @param  {Object} webpackConfig the .core webpack configuration
 * @return {Object} your webpack configuration override
 */
module.exports = webpackConfig => {
    const ignore = webpackConfig.module.rules.find(
        rule => op.get(rule, 'use.0.loader') === 'ignore-loader',
    );
    if (ignore) ignore.test.push(/patch-react-spring.js/);
    return webpackConfig;
};
