/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin Editor
 * -----------------------------------------------------------------------------
 */

import './sdk';
import Component from './index';
import Reactium from 'reactium-core/sdk';
import { ElementDialog } from './ElementDialog';

(async () => {
    await Reactium.Plugin.register('ContentEditor');
    Reactium.Component.register('ContentEditor', Component);
    Reactium.Component.register('ElementDialog', ElementDialog);

    Reactium.Hook.register('blueprints', async Blueprint => {
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
                        zones: [
                            'admin-header',
                            'admin-content-editor',
                            'admin-EVENTS',
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
                ID: 'Content',
                description: 'Content List',
                sections: {
                    sidebar: {
                        zones: ['admin-sidebar'],
                        meta: {},
                    },
                    main: {
                        zones: [
                            'admin-header',
                            'admin-content-list',
                            'admin-EVENTS',
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

    Reactium.Zone.addComponent({
        order: -1000,
        component: Component,
        id: 'ADMIN-CONTENT-EDITOR',
        zone: ['admin-content-editor'],
    });
})();
