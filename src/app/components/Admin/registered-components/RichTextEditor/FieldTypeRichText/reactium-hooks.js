import Reactium from 'reactium-core/sdk';
import FieldTypeRichText from './index';
import { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeRichText');

    Reactium.Component.register('FieldTypeRichText', FieldTypeRichText);

    Reactium.ContentType.FieldType.register({
        type: 'RichText',
        label: __('Rich Text Field'),
        icon: Icon.Feather.Feather,
        tooltip: __('Adds a rich text field to your content type.'),
        component: 'FieldTypeRichText',
        order: Reactium.Enums.priority.highest,
    });
};

registerFieldTypePlugin();
