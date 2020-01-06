import Reactium from 'reactium-core/sdk';
import FieldTypeImage from './index';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeImage');
    Reactium.Component.register('FieldTypeImage', FieldTypeImage);
};

registerFieldTypePlugin();
