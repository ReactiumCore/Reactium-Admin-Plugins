const path = require('path');
const op = require('object-path');
const GENERATOR = require('./generator');
const mod = path.dirname(require.main.filename);
const { error, message } = require(`${mod}/lib/messenger`);

const NAME = 'publish-test';
const CANCELED = 'Action canceled!';
const DESC = 'Test the publish actions';

const HELP = () =>
    console.log(`
Example:
  $ arcli publish-test -h
`);

const ACTION = ({ opt, props }) =>
    GENERATOR({
        params: { filter: opt.filter, append: opt.append },
        props,
    }).catch(err => message(op.get(err, 'message', CANCELED)));

const COMMAND = ({ program, props }) =>
    program
        .command(NAME)
        .description(DESC)
        .action(opt => ACTION({ opt, props }))
        .on('--help', HELP);

module.exports = {
    COMMAND,
    NAME,
};
