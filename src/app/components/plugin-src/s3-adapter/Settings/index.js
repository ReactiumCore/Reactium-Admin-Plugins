import React from 'react';
import { useHookComponent, Zone, __ } from 'reactium-core/sdk';

const settings = {
    title: __('S3 Adapter Settings'),
    group: 'S3Adapter',
    inputs: {
        'S3Adapter.bucket': {
            type: 'text',
            label: __('Bucket name'),
            tooltip: __(
                'The S3 bucket name. See your CDN provider for this setting.',
            ),
            required: true,
        },
        'S3Adapter.s3overrides.accessKeyId': {
            type: 'text',
            label: __('Access Key Id'),
            tooltip: __(
                'The S3 access key id. See your CDN provider for this setting.',
            ),
            required: true,
        },
        'S3Adapter.s3overrides.secretAccessKey': {
            type: 'text',
            label: __('Secret Access Key'),
            tooltip: __(
                'The S3 secret access key. This key is sensitive. See your CDN provider for this setting.',
            ),
            required: true,
        },
        'S3Adapter.s3overrides.endpoint': {
            type: 'text',
            label: __('Endpoint Hostname'),
            tooltip: __(
                'The S3 endpoint hostname, usually excluding the bucket name prefix, for example sfo2.digitaloceanspaces.com or us-west-2.amazonaws.com.',
            ),
            required: true,
        },
        'S3Adapter.region': {
            type: 'text',
            label: __('Region'),
            tooltip: __(
                'The S3 region for your provider, for example sfo2 for DigitalOcean Spaces or us-west-2 for Amazon AWS S3.',
            ),
            required: true,
        },
        'S3Adapter.directAccess': {
            type: 'toggle',
            label: __('Access Files Directly'),
            tooltip: __(
                'If turned on, the URL provided will go directly to your CDN, instead of through the Parse API. If turned off, your Actinium API will serve (proxy) the file from your CDN.',
            ),
            defaultValue: false,
        },
        'S3Adapter.baseUrl': {
            type: 'text',
            label: __('Base URL'),
            tooltip: __(
                'Sets the full base URL used to serve files from your bucket. If your bucket has a CDN URL, or instance, use that here. Example: https://my-bucket.us-west-2.amazonaws.com or https://cdn.example.com.',
            ),
            required: true,
        },
    },
};

const capabilities = [
    {
        capability: 'setting.S3Adapter-get',
        title: __('View S3 Plugin Settings'),
        tooltip: __(
            'Able to see S3 File Adapter plugin settings, but not necessarily change them.',
        ),
    },
    {
        capability: 'setting.S3Adapter-set',
        title: __('Edit S3 Plugin Settings'),
        tooltip: __(
            'Provides ability to configure settings for the S3 File Adapter plugin.',
        ),
    },
];

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Settings
 * -----------------------------------------------------------------------------
 */
const Settings = () => {
    const SettingEditor = useHookComponent('SettingEditor');
    const CapabilityEditor = useHookComponent('CapabilityEditor');

    return (
        <div className='s3-adapter-settings'>
            <SettingEditor settings={settings} />
            <CapabilityEditor capabilities={capabilities} />
            <Zone zone='s3-adapter-settings' />
        </div>
    );
};

export default Settings;
