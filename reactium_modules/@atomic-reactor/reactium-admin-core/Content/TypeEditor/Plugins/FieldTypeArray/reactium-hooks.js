import React from 'react';
import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, { __ } from '@atomic-reactor/reactium-core/sdk';

const ID = 'Array';

const Ico = () => (
    <span
        children='[ ]'
        style={{ color: '#999999', fontSize: 18, whiteSpace: 'nowrap' }}
    />
);

const fieldType = {
    icon: Ico,
    label: __('Array Field'),
    component: 'FieldTypeArray',
    tooltip: __('Adds an Array field type'),
    order: Reactium.Enums.priority.neutral + 1,
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    Reactium.ContentType.FieldType.register(ID, fieldType);
    Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.Component.register(fieldType.component, FieldType);
});
