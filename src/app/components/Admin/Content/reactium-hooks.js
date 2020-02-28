import SDK from './sdk';
import _ from 'underscore';
import cn from 'classnames';
import ContentList from './List';
import ContentEditor from './Editor';
import Sidebar from './Editor/Sidebar';
import Loading from './Editor/Loading';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import HeaderWidget from './HeaderWidget';
import SidebarWidget from './SidebarWidget';
import ElementDialog from './Editor/ElementDialog';
import SlugInput from './Editor/_plugins/SlugInput';
import RevisionsWidget from './Revisions/ToolbarWidget';
import ActivityLogWidget from './ActivityLog/ToolbarWidget';

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
    Reactium.Component.register('AdminContentLoading', Loading);
    Reactium.Component.register('AdminContentSidebar', Sidebar);
    Reactium.Component.register('ElementDialog', ElementDialog);

    // Add components to zones
    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-CRUMBS',
        component: Breadcrumbs,
        order: 1, // don't change this - Cam
        zone: ['admin-header'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-ADD',
        component: HeaderWidget,
        order: 2, // don't change this - Cam
        zone: ['admin-logo'],
    });

    Reactium.Zone.addComponent({
        id: 'AdminContent',
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
        order: 200, // don't change this - Cam
        zone: ['admin-sidebar-menu'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-ACTIVITY-WIDGET',
        component: ActivityLogWidget,
        order: Reactium.Enums.priority.lowest,
        zone: ['admin-content-toolbar-top'],
    });
    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-REVISIONS-WIDGET',
        component: RevisionsWidget,
        order: Reactium.Enums.priority.lowest + 10,
        zone: ['admin-content-toolbar-top'],
    });
};

registerAdminContent();
