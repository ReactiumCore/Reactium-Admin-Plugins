import { Editor, FieldType } from './index';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const ID = 'Wizard';

const Ico = () => {
    const { Icon } = useHookComponent('ReactiumUI');
    return <Icon name='Linear.MagicWand' />;
};

Reactium.Plugin.register(`CTE-${ID}`).then(() => {
    const fieldType = {
        id: String(ID).toLowerCase(),
        label: __('Wizard Field'),
        icon: Ico,
        tooltip: __('Plugin for creating guided walk-throughs..'),
        component: 'Wizard',
        order: Reactium.Enums.priority.highest,
        showHelpText: false,
        singular: true,
        defaultValues: { fieldName: __(ID) },
    };

    Reactium.Component.register(fieldType.component, FieldType);

    Reactium.Content.Editor.register(ID, { component: Editor });

    Reactium.ContentType.FieldType.register(ID, fieldType);
});
