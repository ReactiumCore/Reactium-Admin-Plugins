import React from 'react';
import Reactium, { __ } from 'reactium-core/sdk';
import AppSettings from './index';
import MenuItem from 'components/Admin/registered-components/MenuItem';

const PLUGIN = 'app-settings';
const appSettingsPlugin = async () => {
    await Reactium.Plugin.register(PLUGIN);

    Reactium.Zone.addComponent({
        id: `${PLUGIN}-menu-item`,
        component: () => (
            <MenuItem label={__('Application')} route='/admin/settings' />
        ),
        zone: ['admin-sidebar-settings'],
        order: Reactium.Enums.priority.highest,
    });

    Reactium.Zone.addComponent({
        id: PLUGIN,
        component: AppSettings,
        zone: ['settings-groups'],
        order: 0,
        dialog: {
            header: {
                title: __('Application Settings'),
                elements: [],
            },
            dismissable: false,
        },
        capabilities: ['settings.app-get'],
    });
};

appSettingsPlugin();
