import Reactium from 'reactium-core/sdk';
import FieldTypeCode from './index';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeCode');
    Reactium.Component.register('FieldTypeCode', FieldTypeCode);
};

registerFieldTypePlugin();
