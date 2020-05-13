const path = require('path');
const op = require('object-path');
const GENERATOR = require('./generator');
const mod = path.dirname(require.main.filename);
const { error, message } = require(`${mod}/lib/messenger`);

const NAME = 'install-test';
const CANCELED = 'Action canceled!';
const DESC = 'The description of the command';

const HELP = () =>
    console.log(`
Example:
  $ arcli install-test -h
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
        .option(
            '-F, --no-filter [filter]',
            'Do not filter out scss files prefixed with an underscore.',
        )
        .option(
            '-p, --append [append]',
            'Inject the include path at the end of the file.',
        )
        .on('--help', HELP);

module.exports = {
    COMMAND,
    NAME,
};
