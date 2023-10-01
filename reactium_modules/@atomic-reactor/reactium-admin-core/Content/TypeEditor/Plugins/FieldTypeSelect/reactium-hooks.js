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
    // TODO: Fix Content SDK
    Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.Content.Editor.register(`${ID}Array`, { component: Editor });
    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.ContentType.FieldType.register(ID, fieldType);

    Reactium.Hook.registerSync('content-type-field-type-list', (list) => {
        const Select = op.get(list, 'Select');
        if (!op.get(list, 'SelectArray') && op.get(list, 'Select')) {
            op.set(list, 'SelectArray', { ...Select, type: 'SelectArray' });
        }
    });
});
