import Reactium from 'reactium-core/sdk';
import PermissionSelector from './index';

Reactium.Component.register('PermissionSelector', PermissionSelector);

Reactium.Hook.register('app-ready', () => {
    Reactium.Cloud.run('acl-targets').then(data =>
        Reactium.Cache.set('acl-targets', data),
    );
});
