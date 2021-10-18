const { forceSSL } = require('./forceSSL');
const { Enums } = ReactiumBoot;

// TODO: Move this plugin to reactium-core-plugins project?
ReactiumBoot.Server.Middleware.register('forceSSL', {
    name: 'forceSSL',
    use: forceSSL,
    order: Enums.priority.highest,
});
