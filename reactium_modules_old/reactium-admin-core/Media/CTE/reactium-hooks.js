import React from 'react';
import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from 'reactium-ui';

const ID = 'Media';

const Ico = () => <Icon name='Feather.Image' />;

const fieldType = {
    icon: Ico,
    label: __('Media Field'),
    component: 'FieldTypeMedia',
    tooltip: __('Media field type'),
    order: Reactium.Enums.priority.neutral,
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.ContentType.FieldType.register(ID, fieldType);
});
