import React from 'react';
import Reactium from 'reactium-core/sdk';
import FieldTypeNumber from './index';
import { __ } from 'reactium-core/sdk';
import op from 'object-path';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeNumber');
    Reactium.Component.register('FieldTypeNumber', FieldTypeNumber);

    await Reactium.Hook.register('field-type-enums', async Enums => {
        op.set(Enums, 'TYPES.NUMBER', {
            type: 'Number',
            label: __('Number Field'),
            icon: () => <small style={{ whiteSpace: 'nowrap' }}>1 2 3</small>,
            tooltip: __('Adds a number field to your content type.'),
            component: 'FieldTypeNumber',
            order: Reactium.Enums.priority.neutral,
        });
    });
};

registerFieldTypePlugin();
