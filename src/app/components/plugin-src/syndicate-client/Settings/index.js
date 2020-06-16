import React from 'react';
import { useHookComponent, Zone, __ } from 'reactium-core/sdk';

const settings = {
    title: __('Syndicate Client Settings'),
    group: 'SyndicateClient',
    inputs: {
        'SyndicateClient.appId': {
            type: 'text',
            label: __('Syndicate Host App ID'),
            tooltip: __(
                'The Application ID of the syndication root site (e.g. Actinium).',
            ),
            required: true,
        },
        'SyndicateClient.host': {
            type: 'text',
            label: __('Syndicate Host'),
            tooltip: __('The API URL for the syndication root site.'),
            required: true,
        },
        'SyndicateClient.token': {
            type: 'text',
            label: __('Client Refresh Token'),
            tooltip: __('The refresh token of this syndication client.'),
            required: true,
        },
        'SyndicateClient.enable': {
            type: 'toggle',
            label: __('Client Sync Enabled'),
            tooltip: __('Enable or disable sychronizing to this satellite.'),
            required: true,
        },
        'SyndicateClient.cron': {
            type: 'text',
            label: __('Client Sync Schedule'),
            tooltip: __(
                'The node-cron schedule of the updated (e.g. */30 * * * *).',
            ),
            required: false,
        },
    },
};

const capabilities = [
    {
        capability: 'setting.SyndicateClient-get',
        title: __('View Syndication client settings.'),
        tooltip: __(
            'Able to see Syndicate Client plugin settings, but not necessarily change them.',
        ),
    },
    {
        capability: 'setting.SyndicateClient-set',
        title: __('Edit Syndication Client Plugin Settings'),
        tooltip: __(
            'Provides ability to configure settings for the Syndicate Client plugin.',
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
        <div className='syndicate-client-settings'>
            <SettingEditor settings={settings} />
            <CapabilityEditor capabilities={capabilities} />
            <Zone zone='syndicate-client-settings' />
        </div>
    );
};

export default Settings;
