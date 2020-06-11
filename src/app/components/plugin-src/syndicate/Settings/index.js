import React from 'react';
import { useHookComponent, Zone, __ } from 'reactium-core/sdk';
import Clients from './Clients';
import Types from './Types';

const capabilities = [
    {
        capability: 'SyndicateClient.create',
        title: __('Create a client'),
        tooltip: __('Create a syndication client.'),
    },
    {
        capability: 'SyndicateClient.retrieve',
        title: __('View any client'),
        tooltip: __(
            'Able to view and retrieve refresh token for any syndication client.',
        ),
    },
    {
        capability: 'SyndicateClient.delete',
        title: __('Delete any client'),
        tooltip: __(
            'Delete a client, preventing access to syndicated content.',
        ),
    },
];

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Settings
 * -----------------------------------------------------------------------------
 */
const Settings = () => {
    const CapabilityEditor = useHookComponent('CapabilityEditor');
    const { Tabs } = useHookComponent('ReactiumUI');

    const tabs = () => [
        {
            id: 'types',
            tab: __('Types'),
            content: <Types />,
        },
        {
            id: 'clients',
            tab: __('Clients'),
            content: <Clients />,
        },
    ];

    return (
        <div className='syndication-settings'>
            <Tabs activeTab={0} collapsible={false} data={tabs()} />

            <CapabilityEditor capabilities={capabilities} />
            <Zone zone='syndication-settings' />
        </div>
    );
};

export default Settings;
