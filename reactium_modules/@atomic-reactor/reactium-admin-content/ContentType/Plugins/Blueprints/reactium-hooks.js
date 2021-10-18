import React from 'react';
import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const ID = 'Blueprint';

const Ico = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return <Icon name='Feather.Layout' />;
};

const fieldType = {
    id: String(ID).toLowerCase(),
    label: __('Blueprint'),
    icon: Ico,
    tooltip: __('Adds a blueprint selector to your content type'),
    component: 'Blueprints',
    order: Reactium.Enums.priority.highest,
    singular: true,
    defaultValues: {
        fieldName: __('Blueprint'),
    },
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.ContentType.FieldType.register(ID, fieldType);
});
