import React from 'react';
import { Editor, FieldType, Comparison } from '.';
import Reactium, { __ } from 'reactium-core/sdk';

const ID = 'Number';
const fieldType = {
    label: __('Number Field'),
    icon: () => <small style={{ whiteSpace: 'nowrap' }}>1 2 3</small>,
    tooltip: __('Adds a number field to your content type.'),
    component: 'FieldTypeNumber',
    order: Reactium.Enums.priority.neutral - 1,
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    Reactium.Component.register(fieldType.component, FieldType);

    Reactium.Content.Editor.register(ID, { component: Editor });

    Reactium.Content.Comparison.register(ID, {
        component: Comparison,
    });

    Reactium.ContentType.FieldType.register(ID, fieldType);
});
