import ContentList from './List';
import ContentEditor from './Editor';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import HeaderWidget from './HeaderWidget';
import SidebarWidget from './SidebarWidget';
import SlugInput from './Editor/_plugins/SlugInput';
import ElementDialog from './Editor/ElementDialog';
import SDK from './sdk';
import cn from 'classnames';

const registerAdminContent = async () => {
    await Reactium.Plugin.register(
        'AdminContent',
        Reactium.Enums.priority.high,
    );

    // Extend SDK
    Reactium.Content = SDK;
    Reactium.Utils.cxFactory = namespace => (...params) =>
        cn(...params)
            .split(' ')
            .map(cls => _.compact([namespace, cls]).join('-'))
            .join(' ');

    // Register components
    Reactium.Component.register('SlugInput', SlugInput);
    Reactium.Component.register('ElementDialog', ElementDialog);

    // Add components to zones
    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-CRUMBS',
        component: Breadcrumbs,
        order: 1,
        zone: ['admin-header'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-ADD',
        component: HeaderWidget,
        order: 2,
        zone: ['admin-logo'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-EDITOR',
        component: ContentEditor,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-content-editor'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-LIST',
        component: ContentList,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-content-list'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-SIDEBAR-WIDGET',
        component: SidebarWidget,
        order: 200,
        zone: ['admin-sidebar-menu'],
    });
};

registerAdminContent();
