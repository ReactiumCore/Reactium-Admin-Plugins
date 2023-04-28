import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const ID = 'Date';

const Ico = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return <Icon name='Feather.Calendar' />;
};

const fieldType = {
    icon: Ico,
    showHelpText: false,
    label: __('Date Field'),
    component: 'FieldTypeDate',
    order: Reactium.Enums.priority.neutral - 3,
    tooltip: __('Adds a date field to your content type.'),
};

(async () => {
    await Reactium.Plugin.register(`CTE-${ID}`);

    Reactium.Component.register(fieldType.component, FieldType);
    // TODO: Fix Content SDK
    // Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.ContentType.FieldType.register(ID, fieldType);
})();
