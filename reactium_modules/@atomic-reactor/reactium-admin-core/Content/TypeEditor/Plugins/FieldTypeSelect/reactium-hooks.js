import React from 'react';
import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, {
    __,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

const ID = 'Select';

const Ico = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return <Icon name='Linear.ChevronDownSquare' />;
};

const fieldType = {
    icon: Ico,
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
