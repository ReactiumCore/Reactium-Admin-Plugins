import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, {
    __,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

const ID = 'Boolean';

const Ico = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return <Icon name='Feather.CheckSquare' />;
};

const fieldType = {
    icon: Ico,
    showHelpText: false,
    label: __('Boolean Field'),
    component: 'FieldTypeBoolean',
    order: Reactium.Enums.priority.neutral - 10,
    tooltip: __('Adds a boolean field to your content type.'),
};

(async () => {
    await Reactium.Plugin.register(`CTE-${ID}`);

    Reactium.Component.register(fieldType.component, FieldType);
    Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.ContentType.FieldType.register(ID, fieldType);
})();
