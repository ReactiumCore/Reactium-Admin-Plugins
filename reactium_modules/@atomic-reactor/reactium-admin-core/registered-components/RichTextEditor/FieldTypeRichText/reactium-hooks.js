import Editor from './Editor';
import { __ } from 'reactium-core/sdk';
import FieldTypeRichText from './index';
import Comparison from './Comparison';
import Reactium from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

const ID = 'RichText';
const fieldType = {
    label: __('Rich Text Field'),
    icon: Icon.Feather.Feather,
    tooltip: __('Adds a rich text field to your content type.'),
    component: 'FieldTypeRichText',
    order: Reactium.Enums.priority.highest,
};

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register(fieldType.component);

    Reactium.Component.register('FieldTypeRichText', FieldTypeRichText);

    Reactium.Content.Editor.register(ID, { component: Editor });

    Reactium.Content.Comparison.register(ID, {
        component: Comparison,
    });

    Reactium.ContentType.FieldType.register(ID, fieldType);
};

registerFieldTypePlugin();
