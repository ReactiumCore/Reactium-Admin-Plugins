import Reactium from 'reactium-core/sdk';
import FieldTypeText from './index';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeText');
    Reactium.Component.register('FieldTypeText', FieldTypeText);
};

registerFieldTypePlugin();
