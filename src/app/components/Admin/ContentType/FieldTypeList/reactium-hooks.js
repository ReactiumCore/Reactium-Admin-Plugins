import Reactium from 'reactium-core/sdk';
import FieldTypeList from './index';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeList');
    Reactium.Component.register('FieldTypeList', FieldTypeList);
};

registerFieldTypePlugin();
