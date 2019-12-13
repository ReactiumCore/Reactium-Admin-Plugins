import Reactium from 'reactium-core/sdk';
import CapabilityEditor from './index';

Reactium.Component.register('CapabilityEditor', CapabilityEditor, 0, [
    'Capability.create',
    'Capability.update',
]);
