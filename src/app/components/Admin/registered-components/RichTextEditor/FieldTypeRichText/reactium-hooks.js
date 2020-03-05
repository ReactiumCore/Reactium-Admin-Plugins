import Editor from './Editor';
import { __ } from 'reactium-core/sdk';
import FieldTypeRichText from './index';
import Reactium from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

const registerFieldTypePlugin = async () => {
    const ID = 'FieldTypeRichText';
    await Reactium.Plugin.register(ID);

    Reactium.Component.register(ID, FieldTypeRichText);

    Reactium.Content.Editor.register(ID, { component: Editor });

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
