import React, { useEffect } from 'react';
import { useHandle, Zone } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PluginSettings
 * -----------------------------------------------------------------------------
 */
const PluginSettings = ({ plugin }) => {
    const SearchBar = useHandle('SearchBar');
    useEffect(() => {
        SearchBar.setState({ visible: false });
    });

    return (
        <div className={'plugin-manager-settings'}>
            <Zone zone={`plugin-settings-${plugin.ID}`} plugin={plugin} />
        </div>
    );
};

export default PluginSettings;
