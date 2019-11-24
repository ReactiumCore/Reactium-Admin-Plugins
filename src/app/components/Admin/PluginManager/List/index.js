import React, { useEffect } from 'react';
import { useHookComponent, useHandle } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';
import Group from '../Group';
import { Plugins } from 'reactium-core/components/Plugable';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PluginManager
 * -----------------------------------------------------------------------------
 */
const PluginList = ({ plugins = [], groups, idx }) => {
    const SearchBar = useHandle('SearchBar');
    useEffect(() => SearchBar.setState({ visible: true }));

    const results = idx
        .search(op.get(SearchBar, 'value') || '')
        .map(({ ref }) => ref);
    const pluginGroups = plugins
        .filter(({ ID }) => results.find(ref => ref === ID))
        .reduce(
            (gps, plugin) => {
                const { group, groupName } = plugin;
                gps[group].plugins.push(plugin);
                _.sortBy(gps[group].plugins, 'order');
                return gps;
            },
            Object.entries(groups).reduce((init, [group, groupName]) => {
                init[group] = {
                    group,
                    groupName,
                    plugins: [],
                };
                return init;
            }, {}),
        );

    const PluginGroup = useHookComponent('plugin-manager-plugin-group', Group);

    const render = () => {
        return (
            <div className='plugin-manager-list'>
                {Object.entries(pluginGroups).map(([group, pluginGroup]) => (
                    <PluginGroup key={group} {...pluginGroup} />
                ))}
                <Plugins
                    zone='plugin-manager-list'
                    pluginGroups={pluginGroups}
                />
            </div>
        );
    };

    return render();
};

export default PluginList;
