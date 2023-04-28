import Reactium from 'reactium-core/sdk';
import ContentTypeEditor from './index';
import SidebarWidget from './SidebarWidget';
import Enums from './enums';
import FieldType from './FieldType';
import FieldTypeDialog from './FieldType/Dialog';
import Breadcrumbs from './Breadcrumbs';
import HeaderWidget from './HeaderWidget';
import ConentTypeList from './List';

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
        await Reactium.Hook.run('content-type-enums', Enums);

        Reactium.Zone.addComponent({
            component: Breadcrumbs,
            order: -1000,
            zone: ['admin-header'],
        });

        Reactium.Zone.addComponent({
            id: 'ADMIN-CONTENT-TYPE-ADD',
            component: HeaderWidget,
            order: 2,
            zone: ['admin-logo'],
        });

        Reactium.Zone.addComponent({
            component: SidebarWidget,
            zone: ['admin-sidebar-menu'],
            order: 300,
        });

        Reactium.Zone.addComponent({
            component: ContentTypeEditor,
            zone: ['admin-content-type-editor'],
            order: 0,
            Enums,
        });

        Reactium.Zone.addComponent({
            id: 'ADMIN-CONTENT-TYPE-LIST',
            component: ConentTypeList,
            order: -1000,
            zone: ['admin-content-types'],
        });
    }
};
registerPlugin();

Reactium.Hook.register('blueprints', async Blueprint => {
    [
        {
            ID: 'ContentType',
            description: 'Content type editor',
            sections: {
                sidebar: {
                    zones: ['admin-sidebar'],
                    meta: {},
                },
                main: {
                    zones: [
                        'admin-header',
                        'admin-content-type-editor',
                        'admin-actions',
                    ],
                    meta: {},
                },
            },
            meta: {
                admin: true,
                builtIn: true,
                namespace: 'admin-page',
            },
        },
        {
            ID: 'ContentTypes',
            description: 'Content types',
            sections: {
                sidebar: {
                    zones: ['admin-sidebar'],
                    meta: {},
                },
                main: {
                    zones: [
                        'admin-header',
                        'admin-content-types',
                        'admin-actions',
                    ],
                    meta: {},
                },
            },
            meta: {
                admin: true,
                builtIn: true,
                namespace: 'admin-page',
            },
        },
    ].forEach(bp => Blueprint.register(bp.ID, bp));
});
