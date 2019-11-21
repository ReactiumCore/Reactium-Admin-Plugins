import React from 'react';
import op from 'object-path';
import { useSelect } from 'reactium-core/sdk';
import PluginList from './List';
import PluginSettings from './Settings';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PluginManager
 * -----------------------------------------------------------------------------
 */
const PluginManager = props => {
    const { id: pluginId } = useSelect(state =>
        op.get(state, 'Router.match.params'),
    );

    const renderManager = () => {
        if (!pluginId) return <PluginList />;
        return <PluginSettings pluginId={pluginId} />;
    };

    const render = () => {
        console.log(props);
        return <div className={'plugin-manager'}>{renderManager()}</div>;
    };

    return render();
};

export default PluginManager;
