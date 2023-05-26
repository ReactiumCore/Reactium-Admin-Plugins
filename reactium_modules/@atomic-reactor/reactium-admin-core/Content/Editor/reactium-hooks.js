/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Editor
 * -----------------------------------------------------------------------------
 */

import './sdk';
import Reactium from '@atomic-reactor/reactium-core/sdk';
import { ElementDialog } from './ElementDialog';
import { ContentEditor, NewContentButton } from './index';

(async () => {
    await Reactium.Plugin.register('ContentEditor');
    Reactium.Component.register('ContentEditor', ContentEditor);
    Reactium.Component.register('ElementDialog', ElementDialog);

    Reactium.Zone.addComponent({
        order: -1000,
        component: ContentEditor,
        id: 'ADMIN-CONTENT-EDITOR',
        zone: ['admin-content-editor'],
    });

    Reactium.Zone.addComponent({
        id: 'ADMIN-CONTENT-ACTIONS',
        component: NewContentButton,
        order: 100, // don't change this - Cam
        zone: ['admin-logo', 'admin-content-actions'],
    });

    Reactium.Hook.register('blueprints', async (Blueprint) => {
        [
            {
                ID: 'Content-Editor',
                description: 'Content editor',
                sections: {
                    sidebar: {
                        zones: ['admin-sidebar'],
                        meta: {},
                    },
                    main: {
                        zones: ['admin-header', 'admin-content-editor'],
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
                ID: 'Content',
                description: 'Content List',
                sections: {
                    sidebar: {
                        zones: ['admin-sidebar'],
                        meta: {},
                    },
                    main: {
                        zones: ['admin-header', 'admin-content-list'],
                        meta: {},
                    },
                },
                meta: {
                    admin: true,
                    builtIn: true,
                    namespace: 'admin-page',
                },
            },
        ].forEach((bp) => Blueprint.register(bp.ID, bp));
    });
})();
