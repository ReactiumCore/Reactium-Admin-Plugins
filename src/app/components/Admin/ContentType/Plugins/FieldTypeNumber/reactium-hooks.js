import React from 'react';
import { Editor, FieldType } from '.';
import Reactium, { __ } from 'reactium-core/sdk';

const ID = 'FieldTypeNumber';

Reactium.Plugin.register(ID).then(() => {
    Reactium.Component.register(ID, FieldType);
    Reactium.Component.register(`${ID}-editor`, Editor);

    Reactium.ContentType.FieldType.register({
        type: 'Number',
        label: __('Number Field'),
        icon: () => <small style={{ whiteSpace: 'nowrap' }}>1 2 3</small>,
        tooltip: __('Adds a number field to your content type.'),
        component: 'FieldTypeNumber',
        order: Reactium.Enums.priority.highest + 2,
    });
});
