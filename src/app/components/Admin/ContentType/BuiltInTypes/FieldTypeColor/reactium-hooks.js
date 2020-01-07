import Reactium from 'reactium-core/sdk';
import FieldTypeColor from './index';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeColor');
    Reactium.Component.register('FieldTypeColor', FieldTypeColor);
};

registerFieldTypePlugin();
