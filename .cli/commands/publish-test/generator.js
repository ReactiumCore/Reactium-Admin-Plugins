const ora = require('ora');
const path = require('path');
const op = require('object-path');
const ActionSequence = require('action-sequence');

const normalize = (...args) => path.normalize(path.join(...args));

module.exports = ({ params, props }) => {
    console.log('');
    const spinner = ora({
        spinner: 'dots',
        color: 'cyan',
    });

    spinner.start();

    op.set(
        props,
        'cwd',
        normalize(props.cwd, 'src', 'app', 'components', 'Admin'),
    );

    const actions = require('./actions')(spinner);

    return ActionSequence({
        actions,
        options: { params, props },
    })
        .then(success => {
            spinner.succeed('complete!');
            console.log('');
            return success;
        })
        .catch(error => {
            spinner.fail('error!');
            console.log('');
            console.log(error);
            console.log('');
            return error;
        });
};
