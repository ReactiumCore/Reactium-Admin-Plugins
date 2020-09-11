import React from 'react';
import Enums from './enums';
import op from 'object-path';
import AppSettings from './index';
import Reactium, { __ } from 'reactium-core/sdk';
import useCapabilitySettings from './useCapabilitySettings';
import MenuItem from 'components/Admin/registered-components/MenuItem';

const PLUGIN = 'app-settings';

Reactium.Hook.register('plugin-dependencies', async () => {
    if (!op.get(Reactium, 'Setting.UI')) {
        op.set(
            Reactium,
            'Setting.UI',
            Reactium.Utils.registryFactory('SettingUI'),
        );
    }

    const { title: groupTitle, group, inputs } = Enums.appSettingProps.settings;
    Object.entries(inputs).forEach(([prop, input]) => {
        const id = `${group}.${prop}`;
        Reactium.Setting.UI.register(id, {
            id,
            group,
            groupTitle,
            prop,
            input,
        });
    });
});

const appSettingsPlugin = async () => {
    await Reactium.Plugin.register(PLUGIN);

    if (!op.get(Reactium, 'Capability.Settings')) {
        op.set(
            Reactium,
            'Capability.Settings',
            Reactium.Utils.registryFactory('CapabilitySettings'),
        );
    }

    if (!op.get(Reactium, 'useCapabilitySettings')) {
        op.set(Reactium, 'useCapabilitySettings', useCapabilitySettings);
    }

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
        appSettingProps: Enums.appSettingProps,
        capabilities: ['settings.app-get'],
        title: __('App - Settings'),
    });
};

appSettingsPlugin();

/**
 * @api {Function} Capability.Settings Capability.Settings
 * @apiVersion 3.2.1
 * @apiDescription Registry for adding Capabilites to the Settings dialog.
 * @apiName Capability.Settings
 * @apiGroup Reactium.Capability
 * @apiParam (Registry Object) {String} capability Value used to identify the capability. Example: `my-component.create`.
 * @apiParam (Registry Object) {String} title Display text.
 * @apiParam (Registry Object) {String} tooltip Help text.
 * @apiParam (Registry Object) {Mixed} [zone] Array|String The AppSettings `id` value. If empty, the capabilities will show up in all AppSettings Capabilites list.
 * @apiExample Registration
Reactium.Capability.Settings.register('shortcodes-manage', {
    capability: 'shortcodes.create',
    title: 'Shortcodes: Create/Update/Delete',
    tooltip: 'Ability to manage Shortcodes.',
    zone: 'app-settings',
 });

 * @apiExample Usage
import React from 'react';
import _ from 'underscore';
import Reactium from 'reactium-core/sdk';

const CapabilityList = ({ zone = 'my-zone' }) => {

    // Filter only 'my-zone' capabilities
    const capabilities = _.where(Reactium.Capability.Settings.list, { zone });

    // Render a list
    return (
        <ul>
            {capabilities.map(({ capability, title, tooltip }) => (
                <li key={capability} data-tooltip={tooltip}>
                    {capability} - {title}
                </li>
            ))}
        </ul>
    );
};

 */
