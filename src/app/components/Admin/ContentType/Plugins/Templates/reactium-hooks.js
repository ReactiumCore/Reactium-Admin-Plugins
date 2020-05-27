import React from 'react';
import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const ID = 'Templates';

const Ico = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return <Icon name='Feather.Layout' />;
};

const fieldType = {
    label: __('Templates'),
    icon: Ico,
    tooltip: __('Adds a template selector to your content type'),
    component: ID,
    order: Reactium.Enums.priority.highest,
};

Reactium.Plugin.register(ID).then(() => {
    Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.ContentType.FieldType.register(ID, fieldType);
});
