import React from 'react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';

const capabilities = {};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: AppSettings
 * -----------------------------------------------------------------------------
 */
const AppSettings = ({ appSettingProps }) => {
    const CapabilityEditor = useHookComponent('CapabilityEditor');
    const Zone = useHookComponent('Zone');
    const Helmet = useHookComponent('Helmet');
    const capabilities = op.get(appSettingProps, 'capabilities', []);

    return (
        <div className={'app-settings'}>
            <Helmet>
                <meta charSet='utf-8' />
                <title>{__('App - Settings')}</title>
            </Helmet>

            <CapabilityEditor capabilities={capabilities} />
            <Zone zone={'app-settings'} />
        </div>
    );
};

export default AppSettings;
