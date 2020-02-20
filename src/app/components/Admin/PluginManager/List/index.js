import React, { useEffect } from 'react';
import { useHookComponent, useHandle } from 'reactium-core/sdk';
import op from 'object-path';
import _ from 'underscore';
import Group from '../Group';
import { Zone } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PluginManager
 * -----------------------------------------------------------------------------
 */
const PluginList = ({
    plugins = [],
    groups,
    idx,
    canView = false,
    canActivate = false,
}) => {
    const SearchBar = useHandle('SearchBar');
    useEffect(() => SearchBar.setState({ visible: true }));

    const pluginsById = _.indexBy(plugins, 'ID');
    const results = _.compact(
        idx
            .search(op.get(SearchBar, 'value') || '')
            .map(({ ref }) => pluginsById[ref]),
    );

    // build plugin groups
    const pluginGroups = _.indexBy(
        Object.entries(groups).map(([group, groupName]) => ({
            group,
            groupName,
            plugins: [],
        })),
        'group',
    );

    // add plugins to groups
    results.forEach(plugin => {
        let { group } = plugin;

        // if group label hasn't been provided
        // via `plugin-group-labels` hook, add actinium plugin to "other" group
        if (!op.has(pluginGroups, [group])) {
            if (!op.has(groups, [group])) {
                group = 'other';
            }
        }

        const plugins = op
            .get(pluginGroups, [group, 'plugins'], [])
            .concat(plugin);
        op.set(pluginGroups, [group, 'plugins'], _.sortBy(plugins, 'order'));
    });

    const PluginGroup = useHookComponent('plugin-manager-plugin-group', Group);

    if (!canView) return null;

    const render = () => {
        return (
            <div className='plugin-manager-list'>
                {Object.entries(pluginGroups).map(
                    ([group, pluginGroup]) =>
                        op.get(pluginGroup, 'plugins', []).length > 0 && (
                            <PluginGroup
                                key={group}
                                {...pluginGroup}
                                canActivate={canActivate}
                            />
                        ),
                )}
                <Zone
                    zone='plugin-manager-list'
                    plugins={plugins}
                    groups={groups}
                    idx={idx}
                    canView={canView}
                    canActivate={canActivate}
                />
            </div>
        );
    };

    return render();
};

export default PluginList;
