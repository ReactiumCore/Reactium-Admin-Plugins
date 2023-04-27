const op = require('object-path');

// ReactiumGulp.Enums.style = {
//     MIXINS: -1000,
//     VARIABLES: -900,
//     BASE: -800,
//     ATOMS: 0,
//     MOLECULES: 800,
//     ORGANISMS: 900,
//     OVERRIDES: 1000,
// };
ReactiumGulp.Hook.registerSync('ddd-styles-partial', SassPartial => {
    const Priority = op.get(ReactiumGulp, 'Enums.style');
    op.set(Priority, 'ADMIN_BASE', Priority.ORGANISMS + 1);
    op.set(Priority, 'ADMIN_PLUGIN', Priority.ORGANISMS + 10);

    SassPartial.register('admin-plugin-ddd', {
        pattern: /_reactium-style-admin-plugin/,
        exclude: false,
        priority: Priority.ADMIN_PLUGIN,
    });

    SassPartial.register('admin-plugin-dir', {
        pattern: /admin-plugin\/_reactium-style/,
        exclude: false,
        priority: Priority.ADMIN_PLUGIN,
    });

    SassPartial.register('admin-ddd', {
        pattern: /_reactium-style-admin/,
        exclude: false,
        priority: Priority.ADMIN_BASE,
    });

    SassPartial.register('admin-dir', {
        pattern: /admin\/_reactium-style/,
        exclude: false,
        priority: Priority.ADMIN_BASE,
    });
});
