// import { Editor } from './Editor';
import { FieldType } from './FieldType';
import Reactium, {
    __,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

const ID = 'File';

const Ico = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return <Icon name='Linear.Media' />;
};

const fieldType = {
    icon: Ico,
    showHelpText: false,
    label: __('File'),
    component: 'FieldTypeFile',
    order: Reactium.Enums.priority.neutral,
    tooltip: __('Adds a file uploader filed.'),
};

(async () => {
    await Reactium.Plugin.register(`CTE-${ID}`);

    Reactium.Component.register(fieldType.component, FieldType);
    // Reactium.Content.Editor.register(ID, { component: Editor });
    Reactium.ContentType.FieldType.register(ID, fieldType);
})();
