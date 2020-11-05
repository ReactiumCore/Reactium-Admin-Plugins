import React from 'react';
import ThemeSettings from '.';
import * as Themes from './themes';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

// Create Theme SDK
Reactium.Theme = Reactium.Theme || Reactium.Utils.registryFactory('Theme');

Reactium.Plugin.register('AdminThemeSettings').then(() => {
    // Register default themes
    Object.values(Themes).forEach(theme =>
        Reactium.Theme.register(theme.id, theme),
    );

    // Register ThemeSettings component
    Reactium.Component.register('AdminThemeSettings', ThemeSettings);

    // Add ThemeSettings to settings page
    Reactium.Zone.addComponent({
        order: Reactium.Enums.priority.neutral + 2,
        zone: ['settings-editor-App-inputs'],
        component: props => {
            const Settings = useHookComponent('AdminThemeSettings');
            return <Settings {...props} />;
        },
    });

    Reactium.Hook.registerSync('settings-editor-config-App', inputs => {
        inputs['App.google.analytics.key'] = {
            label: __('Google Analytics API Key'),
            required: false,
            type: 'text',
        };

        // UA-137912516-1
        // AIzaSyA1oBrTSuMi22NMN0Z29fbJ-ckBezrR344

        inputs['App.google.maps.key'] = {
            label: __('Google Map API Key'),
            required: false,
            type: 'text',
        };

        inputs['App.google.maps.zoom'] = {
            label: __('Google Map Zoom'),
            required: false,
            type: 'number',
        };
    });
});
