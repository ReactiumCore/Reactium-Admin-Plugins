import Reactium, { ReactiumSyncState } from 'reactium-core/sdk';
import ContentTypeEditor from './index';
import Enums from './enums';
import FieldType from './FieldType';
import FieldTypeDialog from './FieldType/Dialog';
import Breadcrumbs from './Breadcrumbs';
import HeaderWidget from './HeaderWidget';

const CTE = new ReactiumSyncState({
    ct: {
        fields: {},
        regions: Enums.REQUIRED_REGIONS,
        requiredRegions: Enums.REQUIRED_REGIONS,
        regionFields: {},
        active: 'default',
        error: {},
        updated: new Date(),
        types: [],
    },
});

const noMerge = () => true;
Reactium.Hook.registerSync(
    'use-sync-state-merge-conditions',
    (noMergeConditions, instance) => {
        if (instance === CTE) {
            if (noMergeConditions[noMergeConditions.length - 1] !== noMerge) {
                noMergeConditions.push(noMerge);
            }
        }
    },
);

Reactium.Handle.register('CTE', { current: CTE });

const registerPlugin = async () => {
    // Add ContentType SDK
    Reactium.ContentType = require('./sdk').default;

    await Reactium.Plugin.register(
        'ContentType',
        Reactium.Enums.priority.highest,
    );

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
            component: ContentTypeEditor,
            zone: ['admin-content-type-editor'],
            order: 0,
            Enums,
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
                    zones: ['admin-header', 'admin-content-type-editor'],
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
