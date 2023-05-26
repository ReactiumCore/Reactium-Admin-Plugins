import Login from './index';
import Reactium, { ComponentEvent } from '@atomic-reactor/reactium-core/sdk';

import op from 'object-path';

Reactium.Hook.register(
    'sdk-init',
    async (Reactium) => {
        Reactium.State.addEventListener('LOGIN_NEEDED', (e) => {
            const route = Reactium.Routing.currentRoute;
            if (op.get(route, 'match.match.path') !== '/login') {
                Reactium.Routing.history.push('/login');
            }
        });
    },
    Reactium.Enums.priority.normal,
    'REACTIUM_STATE_LISTENER',
);

Reactium.Hook.register('app-ready', async () => {
    const valid = await Reactium.User.hasValidSession();
    if (!valid) {
        Reactium.State.dispatchEvent(new ComponentEvent('LOGIN_NEEDED'));
    }
});

Reactium.Plugin.register('AdminLogin').then(() => {
    Reactium.Zone.addComponent({
        id: 'ADMIN-LOGIN',
        component: Login,
        zone: ['login'],
        order: -1000,
    });
});

const blueprint = {
    ID: 'Login',
    description: 'Login blueprint',
    sections: {
        main: { zones: ['login'], meta: {} },
        tools: { zones: ['admin-tools'] },
    },
    meta: { admin: true, builtIn: true },
    order: 100,
};

Reactium.Hook.register(
    'routes-init',
    async () => {
        Reactium.Routing.register({
            exact: true,
            path: '/login',
            component: 'Blueprint',
            blueprintId: 'Login',
            blueprint,
        });
    },
    Reactium.Enums.priority.highest - 1,
);

Reactium.Hook.register('blueprints', async (Blueprint) => {
    Blueprint.register('Login', blueprint);
});
