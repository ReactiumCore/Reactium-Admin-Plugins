import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { Editor, FieldType, QuickEditor } from '.';

const ID = 'FieldTypeText';

Reactium.Plugin.register(ID).then(() => {
    Reactium.Component.register(ID, FieldType);
    Reactium.Component.register(`${ID}-editor`, Editor);
    Reactium.Component.register(`${ID}-quick-editor`, QuickEditor);

    Reactium.ContentType.FieldType.register({
        type: 'Text',
        label: __('Text Field'),
        icon: Icon.Feather.Type,
        tooltip: __('Adds a text field to your content type.'),
        component: 'FieldTypeText',
        order: Reactium.Enums.priority.highest + 1,
    });
});
