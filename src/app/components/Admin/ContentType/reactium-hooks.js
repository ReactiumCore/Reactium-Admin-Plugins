import Reactium from 'reactium-core/sdk';
import ContentTypeEditor from './index';
import SidebarWidget from './SidebarWidget';

const registerPlugin = async () => {
    await Reactium.Plugin.register('content-type');

    const permitted = await Reactium.Capability.check(['type-ui.view']);

    if (permitted) {
        Reactium.Zone.addComponent({
            component: SidebarWidget,
            zone: ['admin-sidebar-menu'],
            order: 0,
        });

        Reactium.Zone.addComponent({
            component: ContentTypeEditor,
            zone: ['admin-content-type-editor'],
            order: 0,
        });
    }
};
registerPlugin();
