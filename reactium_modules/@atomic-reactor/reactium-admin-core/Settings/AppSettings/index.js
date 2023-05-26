import React from 'react';
import op from 'object-path';
import Reactium, {
    useHookComponent,
    __,
} from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: AppSettings
 * -----------------------------------------------------------------------------
 */
const AppSettings = ({
    appSettingProps,
    children,
    className = 'app-settings',
    id = 'app-settings',
    title,
}) => {
    const Zone = useHookComponent('Zone');
    const Helmet = useHookComponent('Helmet');
    const CapabilityEditor = useHookComponent('CapabilityEditor');
    const SettingEditor = useHookComponent('SettingEditor');

    const { useCapabilitySettings } = Reactium;
    const [capabilities] = useCapabilitySettings(
        id,
        op.get(appSettingProps, 'capabilities', []),
    );

    const settings = {
        group: 'App',
        title: __('Application Settings'),
    };

    Reactium.Setting.UI.list
        .filter((item) => item.group === settings.group)
        .forEach((item) => {
            op.set(settings, ['inputs', item.id], { ...item.input });
        });

    return (
        <div className={className}>
            {title && (
                <Helmet>
                    <meta charSet='utf-8' />
                    <title>{title}</title>
                </Helmet>
            )}
            <SettingEditor settings={settings} />
            {capabilities && capabilities.length > 0 && (
                <CapabilityEditor
                    capabilities={capabilities}
                    height='calc(100vh - 196px)'
                    pref='admin.dialog.capabilities'
                />
            )}
            {children}
            {id && <Zone zone={id} />}
        </div>
    );
};

export { AppSettings, AppSettings as default };
