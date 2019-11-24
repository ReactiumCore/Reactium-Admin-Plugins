import React, { useEffect } from 'react';
import { useHandle } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PluginManager
 * -----------------------------------------------------------------------------
 */
const PluginSettings = props => {
    const SearchBar = useHandle('SearchBar');
    useEffect(() => SearchBar.setState({ visible: false }));

    return (
        <div className={'plugin-manager-settings'}>
            <h1>PluginSettings</h1>
        </div>
    );
};

export default PluginSettings;
