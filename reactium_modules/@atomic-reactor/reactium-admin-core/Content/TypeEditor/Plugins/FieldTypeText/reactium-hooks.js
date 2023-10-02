import Reactium, { __ } from '@atomic-reactor/reactium-core/sdk';
import { Icon } from 'reactium-ui';
import { Editor, FieldType } from '.';

const ID = 'Text';

const fieldType = {
    label: __('Text Field'),
    icon: Icon.Feather.Type,
    tooltip: __('Adds a text field to your content type.'),
    component: 'FieldTypeText',
    order: Reactium.Enums.priority.neutral - 1,
};

(() => {
    Reactium.Plugin.register(`CTE-${ID}`).then(() => {
        Reactium.ContentType.FieldType.register(ID, fieldType);
        Reactium.Component.register(fieldType.component, FieldType);
        Reactium.Content.Editor.register(ID, { component: Editor });

        // TODO: Fix Content Quickstart and Revisions
        // Reactium.Content.QuickEditor.register(ID, { component: QuickEditor });
        // Reactium.Content.Comparison.register(ID, { component: Comparison });
    });
})();
