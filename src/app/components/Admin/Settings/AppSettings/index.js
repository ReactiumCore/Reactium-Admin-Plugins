import React from 'react';
import op from 'object-path';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

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

    const { useCapabilitySettings } = Reactium;
    const [capabilities] = useCapabilitySettings(
        id,
        op.get(appSettingProps, 'capabilities', []),
    );

    return (
        <div className={className}>
            {title && (
                <Helmet>
                    <meta charSet='utf-8' />
                    <title>{title}</title>
                </Helmet>
            )}
            {capabilities && capabilities.length > 0 && (
                <CapabilityEditor
                    capabilities={capabilities}
                    height='calc(100vh - 182px)'
                />
            )}
            {children}
            {id && <Zone zone={id} />}
        </div>
    );
};

export { AppSettings, AppSettings as default };
