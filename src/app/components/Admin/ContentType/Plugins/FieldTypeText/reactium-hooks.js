import { __ } from 'reactium-core/sdk';
import Reactium from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { Editor, FieldType, QuickEditor } from '.';

const registerFieldTypePlugin = async () => {
    const ID = 'FieldTypeText';

    await Reactium.Plugin.register(ID);

    Reactium.Component.register(ID, FieldType);
    Reactium.Component.register(`${ID}-editor`, Editor);
    Reactium.Component.register(`${ID}-quick-editor`, QuickEditor);

    Reactium.ContentType.FieldType.register({
        type: 'Text',
        label: __('Text Field'),
        icon: Icon.Feather.Type,
        tooltip: __('Adds a text field to your content type.'),
        component: 'FieldTypeText',
        order: Reactium.Enums.priority.highest,
    });
};

registerFieldTypePlugin();
