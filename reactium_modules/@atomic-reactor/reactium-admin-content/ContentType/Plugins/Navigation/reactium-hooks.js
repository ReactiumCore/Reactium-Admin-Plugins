import Reactium, { __ } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import { FieldType } from '.';
import { Editor } from '../Collection';

const ID = 'Navigation';

const fieldType = {
    id: 'navigation',
    label: __('Navigation'),
    icon: Icon.Linear.Menu3,
    tooltip: __('Adds a navigation to the content type.'),
    component: 'FieldTypeNavigation',
    singular: true,
    defaultRegion: 'sidebar',
    order: Reactium.Enums.priority.normal,
    defaultValues: {
        fieldName: __('Navigation'),
        query: JSON.stringify([
            {
                id: 'find',
                config: {
                    id: 'find',
                    label: '%func(%options)',
                    options: {
                        placeholder: 'useMasterKey: true, sessionToken: %token',
                        type: 'object',
                    },
                    order: 1002,
                    excludeWhen: ['first', 'get', 'count'],
                    max: 1,
                },
                func: 'find',
                keys: [],
                order: 1002,
            },
        ]),
        collection: 'navigation',
        targetClass: 'Content_navigation',
    },
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    Reactium.Component.register(fieldType.component, FieldType);

    Reactium.Content.Editor.register(ID, { component: Editor });

    // Reactium.Content.QuickEditor.register(ID, { component: QuickEditor });

    // Reactium.Content.Comparison.register(ID, { component: Comparison });

    Reactium.ContentType.FieldType.register(ID, fieldType);
});
