import op from 'object-path';
import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, { __ } from '@atomic-reactor/reactium-core/sdk';
import { Icon } from 'reactium-ui';

const ID = 'Select';

const fieldType = {
    icon: Icon.Linear.ChevronDownSquare,
    label: __('Select Field'),
    component: 'FieldTypeSelect',
    tooltip: __('Adds a select element'),
    order: Reactium.Enums.priority.highest + 1,
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.ContentType.FieldType.register(ID, fieldType);
});
