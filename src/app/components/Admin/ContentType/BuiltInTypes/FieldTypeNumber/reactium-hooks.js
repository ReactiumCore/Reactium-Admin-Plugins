import Reactium from 'reactium-core/sdk';
import FieldTypeNumber from './index';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeNumber');
    Reactium.Component.register('FieldTypeNumber', FieldTypeNumber);
};

registerFieldTypePlugin();
