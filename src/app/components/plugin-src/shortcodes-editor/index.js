import React from 'react';
import ShortcodeRTE from './RTE';
import Shortcodes from './Shortcodes';
import SaveWidget from './SaveWidget';
import Breadcrumbs from './Breadcrumbs';
import SidebarWidget from './SidebarWidget';
import Reactium, { __ } from 'reactium-core/sdk';

Reactium.Plugin.register('shortcodes', 1).then(() => {
    // Only use this plugin if the Shortcode SDK is loaded.
    if (!Reactium.Shortcode) return;

    // RTE Plugin
    Reactium.RTE.Plugin.register('shortcode', ShortcodeRTE);

    Reactium.Component.register('ShortcodeTextEditor', props => (
        <span>
            <span
                {...props}
                className='rte-shortcode strong'
                contentEditable={false}
            />
        </span>
    ));

    Reactium.Shortcode.Component.register('ShortcodeText', {
        component: 'ShortcodeText', // ID of a registered component. Used in the front end when this shortcode is replaced.
        editorComponent: 'ShortcodeTextEditor', // ID of a registered component. Used in the RTE when this shortcode is selected.
        label: 'Text', // String|Node used in the dropdown.
        order: -1, // Order used when listing in dropdown.
        attributes: undefined, // Hash of attributes used in the content editor when adding a shortcode to content
        validate: undefined, // Validation function See EventForm validate property
    });

    Reactium.Shortcode.Component.register('ShortcodeTest', {
        component: 'ShortcodeTest',
        label: 'Test',
        attributes: {
            name: { type: 'text' },
            phone: {
                type: 'phone',
                label: 'Phone Number:',
                placeholder: '(555) 555-5555',
            },
            count: { type: 'number', min: 1, max: 5 },
            description: { type: 'textarea' },
        },
    });

    Reactium.Zone.addComponent({
        id: 'SHORTCODES-BREADCRUMBS',
        zone: ['admin-header'],
        component: Breadcrumbs,
        order: 0,
    });

    Reactium.Zone.addComponent({
        id: 'SHORTCODES-SAVE-WIDGET',
        zone: ['admin-logo'],
        component: SaveWidget,
        order: 100,
    });

    Reactium.Zone.addComponent({
        id: 'SHORTCODES-SIDEBAR-WIDGET',
        zone: ['admin-sidebar-menu'],
        component: SidebarWidget,
        order: 401,
    });

    // Reactium SDK calls here
    Reactium.Zone.addComponent({
        id: 'SHORTCODES',
        zone: ['admin-shortcodes'],
        component: Shortcodes,
        order: 0,
    });

    // Settings Capabilites
    Reactium.Capability.Settings.register('shortcodes-manage', {
        zone: 'app-settings',
        capability: 'shortcodes.create',
        title: __('Shortcodes: Create/Update/Delete'),
        tooltip: __(
            'Able to view and manage Admin Shortcodes page when logged in.',
        ),
    });
});
