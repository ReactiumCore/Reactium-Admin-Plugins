import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { Editor, FieldType } from '.';

const ID = 'Collection';

const fieldType = {
    label: __('Collection'),
    icon: Icon.Linear.Library,
    tooltip: __('Adds a Collection to the content type.'),
    component: 'FieldTypeCollection',
    order: Reactium.Enums.priority.lowest,
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    Reactium.Component.register(fieldType.component, FieldType);

    Reactium.Content.Editor.register(ID, { component: Editor });

    // Reactium.Content.QuickEditor.register(ID, { component: QuickEditor });

    // Reactium.Content.Comparison.register(ID, { component: Comparison });

    Reactium.ContentType.FieldType.register(ID, fieldType);
});
