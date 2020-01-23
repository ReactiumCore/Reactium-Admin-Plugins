import Reactium from 'reactium-core/sdk';
import ContentTypeEditor from './index';
import SidebarWidget from './SidebarWidget';
import Enums from './enums';
import FieldType from './FieldType';
import FieldTypeDialog from './FieldType/Dialog';
import Breadcrumbs from './Breadcrumbs';

const registerPlugin = async () => {
    await Reactium.Plugin.register(
        'ContentType',
        Reactium.Enums.priority.highest,
    );

    // Add ContentType SDK
    Reactium.ContentType = require('./sdk').default;

    // Register FieldType Base Components
    Reactium.Component.register('FieldType', FieldType);
    Reactium.Component.register('FieldTypeDialog', FieldTypeDialog);

    const permitted = await Reactium.Capability.check(['type-ui.view']);

    if (permitted) {
        await Reactium.Hook.run('field-type-enums', Enums);

        Reactium.Zone.addComponent({
            component: Breadcrumbs,
            order: -1000,
            zone: ['admin-header'],
        });

        Reactium.Zone.addComponent({
            component: SidebarWidget,
            zone: ['admin-sidebar-menu'],
            order: 0,
        });

        Reactium.Zone.addComponent({
            component: ContentTypeEditor,
            zone: ['admin-content-type-editor'],
            order: 0,
            Enums,
        });
    }
};
registerPlugin();
