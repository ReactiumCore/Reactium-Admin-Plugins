import React from 'react';
import Reactium from 'reactium-core/sdk';
import FieldTypeNumber from './index';
import { __ } from 'reactium-core/sdk';

const registerFieldTypePlugin = async () => {
    await Reactium.Plugin.register('FieldTypeNumber');

    Reactium.Component.register('FieldTypeNumber', FieldTypeNumber);

    Reactium.ContentType.FieldType.register({
        type: 'Number',
        label: __('Number Field'),
        icon: () => <small style={{ whiteSpace: 'nowrap' }}>1 2 3</small>,
        tooltip: __('Adds a number field to your content type.'),
        component: 'FieldTypeNumber',
        order: Reactium.Enums.priority.neutral,
    });
};

registerFieldTypePlugin();
