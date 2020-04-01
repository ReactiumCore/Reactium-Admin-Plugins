import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { Comparison, Editor, FieldType } from './index';

const ID = 'Link';

const fieldType = {
    label: __('Link Field'),
    icon: Icon.Feather.Link,
    tooltip: __('Adds a link field to your content type.'),
    component: 'FieldTypeLink',
    order: Reactium.Enums.priority.highest + 1,
};

Reactium.Plugin.register(ID).then(() => {
    Reactium.Component.register(fieldType.component, FieldType);

    Reactium.Content.Editor.register(ID, { component: Editor });

    Reactium.Content.Comparison.register(ID, { component: Comparison });

    Reactium.ContentType.FieldType.register(ID, fieldType);
});
