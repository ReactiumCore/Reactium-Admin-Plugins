import Reactium from 'reactium-core/sdk';
import PermissionSelector from './index';

Reactium.Component.register('PermissionSelector', PermissionSelector);

Reactium.Hook.register('app-ready', async () => {
    const isUser = await Reactium.User.hasValidSession();
    if (!isUser) return;

    Reactium.Cloud.run('acl-targets').then(data =>
        Reactium.Cache.set('acl-targets', data),
    );
});
