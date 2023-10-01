import React from 'react';
import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, { __ } from '@atomic-reactor/reactium-core/sdk';

const ID = 'Object';

const Ico = () => (
    <span
        style={{ color: '#999999', fontSize: 18, whiteSpace: 'nowrap' }}
        children='{ }'
    />
);

const fieldType = {
    icon: Ico,
    label: __('Object Field'),
    component: 'FieldTypeObject',
    tooltip: __('Adds an Object field type'),
    order: Reactium.Enums.priority.neutral,
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.ContentType.FieldType.register(ID, fieldType);
});
