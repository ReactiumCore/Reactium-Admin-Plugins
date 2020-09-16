/**
 * -----------------------------------------------------------------------------
 * Reactium Plugin PickerTest
 * -----------------------------------------------------------------------------
 */

import Component from './index';
import Reactium from 'reactium-core/sdk';
import Blueprint from 'components/Admin/Blueprint';
import op from 'object-path';

// Manually create blueprint and route with Blueprint component
Reactium.Hook.register('blueprints', registry => {
    registry.register('PickerTest', {
        sections: {
            sidebar: {
                zones: ['admin-sidebar'],
                meta: {},
            },
            main: {
                zones: ['admin-header', 'admin-picker-test', 'admin-actions'],
                meta: {},
            },
            tools: {
                zones: ['admin-tools'],
            },
        },
        ID: 'PickerTest',
        description: 'Test Media Picker',
    });

    const route = {
        id: 'picker-test',
        path: ['/picker-test'],
        component: Blueprint,
        blueprint: registry.get('PickerTest'),
    };

    op.set(
        route,
        'load',
        Blueprint.actions.loadFactory(
            route,
            {
                blueprint: 'PickerTest',
            },
            route.blueprint,
        ),
    );

    Reactium.Routing.register(route);
});

Reactium.Plugin.register('PickerTest-plugin').then(() => {
    Reactium.Zone.addComponent({
        id: 'PICKER-TEST',
        component: Component,
        zone: ['admin-picker-test'],
        order: Reactium.Enums.priority.highest,
    });
});
