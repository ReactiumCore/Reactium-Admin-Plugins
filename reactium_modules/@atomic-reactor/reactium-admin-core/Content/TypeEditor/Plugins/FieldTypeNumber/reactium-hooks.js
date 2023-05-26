import React from 'react';
import { Editor, FieldType, Comparison } from '.';
import Reactium, { __ } from '@atomic-reactor/reactium-core/sdk';

const ID = 'Number';
const fieldType = {
    label: __('Number Field'),
    icon: () => <small style={{ whiteSpace: 'nowrap' }}>1 2 3</small>,
    tooltip: __('Adds a number field to your content type.'),
    component: 'FieldTypeNumber',
    order: Reactium.Enums.priority.neutral - 3,
};

(async () => {
    Reactium.Plugin.register(`CTE-${ID}`).then(() => {
        Reactium.Component.register(fieldType.component, FieldType);
        Reactium.Content.Editor.register(ID, { component: Editor });

        // TODO: Fix Content SDK revisions
        // Reactium.Content.Comparison.register(ID, {
        //     component: Comparison,
        // });

        Reactium.ContentType.FieldType.register(ID, fieldType);
    });
})();
