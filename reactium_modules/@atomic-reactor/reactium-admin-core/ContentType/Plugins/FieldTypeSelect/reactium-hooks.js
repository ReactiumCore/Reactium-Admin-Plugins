import React from 'react';
import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';

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
