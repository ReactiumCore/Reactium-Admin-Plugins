import ContentList from './List';
import ContentEditor from './Editor';
import Breadcrumbs from './Breadcrumbs';
import Reactium from 'reactium-core/sdk';
import HeaderWidget from './HeaderWidget';

Reactium.Plugin.register('AdminContent', Reactium.Enums.priority.lowest).then(
    () => {
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
    },
);
