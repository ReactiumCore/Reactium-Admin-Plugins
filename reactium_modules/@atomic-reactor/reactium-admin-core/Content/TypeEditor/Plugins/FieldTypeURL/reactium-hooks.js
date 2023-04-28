import { Editor, FieldType, UrlSelect } from './index';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const ID = 'URLS';

const Ico = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return <Icon name='Feather.Link' />;
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    const fieldType = {
        id: String(ID).toLowerCase(),
        label: __('URL Field'),
        icon: Ico,
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
