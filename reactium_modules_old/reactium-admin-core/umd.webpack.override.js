module.exports = (umd, config) => {
    if (umd.libraryName === 'media-uploader') {
        delete config.module.rules;
    }
    return config;
};
