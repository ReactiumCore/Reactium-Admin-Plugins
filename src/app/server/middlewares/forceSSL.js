module.exports = {
    forceSSL: (req, res, next) => {
        if (
            process.env.SSL_MODE === 'on' &&
            process.env.NODE_ENV !== 'development'
        ) {
            if (req.headers['x-forwarded-proto'] !== 'https') {
                const route = `https://${req.hostname}${req.originalUrl}`;
                res.redirect(301, route);
            } else {
                next();
            }
        } else {
            next();
        }
    },
};
