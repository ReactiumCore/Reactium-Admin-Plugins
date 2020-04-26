import Reactium, { __ } from 'reactium-core/sdk';
import FieldType from './FieldType';
import { Icon } from '@atomic-reactor/reactium-ui';
import op from 'object-path';
import SDK from './sdk';

const ID = 'MenuBuilder';

const fieldType = {
    label: __('Menu Field'),
    icon: Icon.Feather.Menu,
    tooltip: __('Adds a menu field to your content type.'),
    component: 'FieldTypeMenuBuilder',
    order: Reactium.Enums.priority.highest,
};

const pluginInit = async () => {
    await Reactium.Plugin.register(ID);
    Reactium.MenuBuilder = SDK;

    // Register FieldType component
    Reactium.Component.register(fieldType.component, FieldType);

    // Register FieldType with Content Type Editor
    Reactium.ContentType.FieldType.register(ID, fieldType);

    const contentTypes = await Reactium.ContentType.types();
    contentTypes.forEach(contentType => {
        const id = op.get(contentType, 'uuid');
        const collection = op.get(contentType, 'collection');
        const label = op.get(
            contentType,
            'meta.label',
            op.get(contentType, 'type'),
        );
        const type = 'ContentType';

        Reactium.MenuBuilder.ItemType.register(id, {
            id,
            collection,
            label,
            type,
        });
    });
};

pluginInit();
