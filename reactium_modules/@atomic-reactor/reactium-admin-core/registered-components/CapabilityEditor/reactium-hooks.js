import Reactium from 'reactium-core/sdk';
import CapabilityEditor from './index';

Reactium.Component.register('CapabilityEditor', CapabilityEditor);

// Clear cached values
Reactium.Hook.register('user.before.logout', () => {
    const keys = Reactium.Cache.keys();
    keys.forEach(key => {
        if (!String(key).startsWith('capabilities')) return;
        Reactium.Cache.del(key);
    });
});
