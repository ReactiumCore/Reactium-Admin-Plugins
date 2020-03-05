import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { Editor, FieldType, QuickEditor } from '.';
import op from 'object-path';

const ID = 'Text';

const fieldType = {
    type: ID,
    label: __('Text Field'),
    icon: Icon.Feather.Type,
    tooltip: __('Adds a text field to your content type.'),
    component: 'FieldTypeText',
    order: Reactium.Enums.priority.highest + 1,
};

Reactium.Plugin.register(ID).then(() => {
    Reactium.Component.register(fieldType.component, FieldType);

    Reactium.Content.Editor.register(ID, { component: Editor });

    Reactium.Content.QuickEditor.register(ID, { component: QuickEditor });

    Reactium.ContentType.FieldType.register(fieldType);
});
