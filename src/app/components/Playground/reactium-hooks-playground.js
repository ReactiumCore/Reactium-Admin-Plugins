/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Playground
 * -----------------------------------------------------------------------------
 */
(async () => {
    const { Hook, Enums, Component } = await import(
        '@atomic-reactor/reactium-core/sdk'
    );

    Hook.register(
        'plugin-init',
        async () => {
            const { Playground } = await import('./Playground');
            Component.register('Playground', Playground);
        },
        Enums.priority.normal,
        'plugin-init-Playground',
    );
})();
