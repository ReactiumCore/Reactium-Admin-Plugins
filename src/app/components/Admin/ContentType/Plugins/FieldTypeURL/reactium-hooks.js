import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { Comparison, Editor, FieldType } from './index';

const ID = 'URLS';

Reactium.Plugin.register(ID).then(() => {
    const fieldType = {
        id: 'urls',
        label: __('URL Field'),
        icon: Icon.Feather.Link,
        tooltip: __('Adds URLs to a content type.'),
        component: 'FieldTypeURL',
        order: Reactium.Enums.priority.highest,
        showHelpText: false,
        singular: true,
        defaultValues: {
            fieldName: __('URLS'),
            required: true,
        },
    };

    Reactium.Component.register(fieldType.component, FieldType);

    Reactium.Content.Editor.register(ID, { component: Editor });

    Reactium.Content.Comparison.register(ID, { component: Comparison });

    Reactium.ContentType.FieldType.register(ID, fieldType);
});
