import React from 'react';
import { useHookComponent, Zone, __ } from 'reactium-core/sdk';

const capabilities = [
    {
        capability: 's3-adapter.settings-set',
        title: 'Setup S3 Plugin',
        tooltip: __(
            'Provides ability to configure settings for the S3 file adapter plugin.',
        ),
    },
];

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Settings
 * -----------------------------------------------------------------------------
 */
const Settings = props => {
    const CapabilityEditor = useHookComponent('CapabilityEditor');

    return (
        <div className='s3-adapter-settings'>
            <CapabilityEditor capabilities={capabilities} />
            <Zone zone='s3-adapter-settings' />
        </div>
    );
};

export default Settings;
