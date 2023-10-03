/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Media
 * -----------------------------------------------------------------------------
 */
(async () => {
    const { Hook, Enums, Component } = await import(
        '@atomic-reactor/reactium-core/sdk'
    );

    Hook.register(
        'plugin-init',
        async () => {
            const { Media } = await import('./Media');
            Component.register('Media', Media);
        },
        Enums.priority.normal,
        'plugin-init-Media',
    );
})();
