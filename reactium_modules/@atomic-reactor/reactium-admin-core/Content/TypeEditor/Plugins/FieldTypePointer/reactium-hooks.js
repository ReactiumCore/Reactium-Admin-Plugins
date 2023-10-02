import React from 'react';
import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, {
    __,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

const ID = 'Pointer';

const Ico = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return <Icon name='Linear.PointerUp' />;
};

const fieldType = {
    icon: Ico,
    label: __('Pointer Field'),
    component: 'FieldTypePointer',
    tooltip: __('Adds an Pointer field type'),
    order: Reactium.Enums.priority.neutral,
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    Reactium.ContentType.FieldType.register(ID, fieldType);
    Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.Component.register(fieldType.component, FieldType);
});
