(async () => {
    ReactiumBoot.Hook.registerSync(
        'Server.AppBindings',
        (req, AppBindings) => {
            AppBindings.register('admin-tools', {
                markup: '<div data-reactium-bind="Tools"></div>',
            });
        },
        ReactiumBoot.Enums.priority.highest - 1,
        'ADMIN-CORE-TOOLS-BINDING',
    );
})();
