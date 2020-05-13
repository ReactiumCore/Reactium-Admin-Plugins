const path = require('path');

module.exports = spinner =>
    require(path.normalize(
        path.join(
            path.resolve(
                process.cwd(),
                'src',
                'app',
                'components',
                'Admin',
                'arcli-install',
            ),
        ),
    ))(spinner);
