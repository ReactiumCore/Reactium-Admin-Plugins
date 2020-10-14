import React from 'react';
import ThemeSettings from '.';
import * as Themes from './themes';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

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
});
