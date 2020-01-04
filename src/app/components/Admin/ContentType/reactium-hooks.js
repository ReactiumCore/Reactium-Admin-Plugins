import Reactium from 'reactium-core/sdk';
import ContentTypeEditor from './index';
import SidebarWidget from './SidebarWidget';
import Enums from './enums';

Reactium.Hook.register(
    'field-type-enums',
    async context => {
        context.Enums = Enums;
    },
    Reactium.Enums.priority.highest,
);

const registerPlugin = async () => {
    await Reactium.Plugin.register('content-type');

    const permitted = await Reactium.Capability.check(['type-ui.view']);

    if (permitted) {
        const { Enums } = await Reactium.Hook.run('field-type-enums');

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
