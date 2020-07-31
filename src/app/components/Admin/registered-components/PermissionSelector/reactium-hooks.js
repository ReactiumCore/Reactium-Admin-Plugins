import Reactium from 'reactium-core/sdk';
import PermissionSelector from './index';

Reactium.Component.register('PermissionSelector', PermissionSelector);

Reactium.Hook.register(
    'plugin-dependencies',
    async () => {
        const isUser = await Reactium.User.hasValidSession();
        if (!isUser) return;

        Reactium.Cloud.run('acl-targets').then(data =>
            Reactium.Cache.set('acl-targets', data),
        );
    },
    -1000,
);
