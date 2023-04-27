// ReactiumBabel.Hook.runSync('aliases', ReactiumBabel.ModuleAliases);
ReactiumBabel.Hook.registerSync(
    'aliases',
    ModuleAliases => {
        ModuleAliases.register('reactium-admin-core', {
            path: './reactium_modules/@atomic-reactor/reactium-admin-core',
        });

        ModuleAliases.register('reactium-ui', {
            path:
                './reactium_modules/@atomic-reactor/reactium-admin-core/reactium-ui',
        });
    },
    ReactiumBabel.Enums.priority.highest,
    'REACTIUM_ADMIN_CORE_BABEL_ALIASES',
);
