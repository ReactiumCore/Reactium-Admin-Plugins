import React from 'react';
import ThemeSettings from '.';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

Reactium.Theme = Reactium.Utils.registryFactory('Theme');

Reactium.Plugin.register('AdminThemeSettings').then(() => {
    // TODO: Remove this register - THIS IS TEMPORARILY HERE
    Reactium.Theme.register('solar', {
        label: 'Solar',
        description: __('Solar site theme'),
        scss: '/solar-theme.scss',
        css: '/solar-theme.css',
    });

    Reactium.Component.register('AdminThemeSettings', ThemeSettings);

    Reactium.Zone.addComponent({
        order: Reactium.Enums.priority.neutral + 2,
        zone: ['settings-editor-App-inputs'],
        component: props => {
            const Settings = useHookComponent('AdminThemeSettings');
            return <Settings {...props} />;
        },
    });
});
