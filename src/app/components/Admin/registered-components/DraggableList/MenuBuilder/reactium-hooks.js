import Reactium, { __ } from 'reactium-core/sdk';
import FieldType from './FieldType';
import Editor from './Editor';
import { Icon } from '@atomic-reactor/reactium-ui';
import {
    ContentTypeControl,
    ContentTypeMenuItem,
} from './MenuItem/ContentType';
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

    const types = await Reactium.ContentType.types();
    Reactium.MenuBuilder.ItemType.register('ContentType', {
        types,
        Control: ContentTypeControl,
        MenuItem: ContentTypeMenuItem,
    });

    Reactium.Content.Editor.register(ID, { component: Editor });
};

pluginInit();
