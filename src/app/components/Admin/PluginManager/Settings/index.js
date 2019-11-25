import React, { useEffect } from 'react';
import { useHandle, Plugins } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PluginManager
 * -----------------------------------------------------------------------------
 */
const PluginSettings = ({ plugin }) => {
    const SearchBar = useHandle('SearchBar');
    useEffect(() => SearchBar.setState({ visible: false }));

    return (
        <div className={'plugin-manager-settings'}>
            <Plugins zone={`plugin-settings-${plugin.ID}`} plugin={plugin} />
        </div>
    );
};

export default PluginSettings;
