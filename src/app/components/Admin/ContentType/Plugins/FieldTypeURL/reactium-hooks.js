import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { Editor, FieldType, UrlSelect } from './index';

const ID = 'URLS';

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
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

    Reactium.Component.register('UrlSelect', UrlSelect);

    Reactium.Component.register(fieldType.component, FieldType);

    Reactium.Content.Editor.register(ID, { component: Editor });

    // TODO: Can't compare because this field type in the editor doesn't use the
    // Reactium.Content.Comparison.register(ID, { component: Comparison });

    Reactium.ContentType.FieldType.register(ID, fieldType);
});
