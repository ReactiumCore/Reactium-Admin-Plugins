import React, { memo, useEffect } from 'react';
import op from 'object-path';
import Reactium, {
    __,
    useReduxState,
    useRegisterHandle,
    useCapabilityCheck,
    isBrowserWindow,
} from 'reactium-core/sdk';
import PluginList from './List';
import PluginSettings from './Settings';
import domain from './domain';
import lunr from 'lunr';
import _ from 'underscore';

const getPlugins = async () => {
    try {
        const { plugins = [] } = await Reactium.Cloud.run('plugins');
        return plugins;
    } catch (error) {
        console.log(error);
    }
    return [];
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PluginManager
 * -----------------------------------------------------------------------------
 */
const PluginManager = memo(props => {
    const canView = useCapabilityCheck(['plugin-ui.view']);
    const canActivate = useCapabilityCheck(['plugins.activate']);

    const pluginId = op.get(props, 'params.id');
    const [plugins, setState] = useReduxState(state => {
        const { plugins } = op.get(state, domain.name, []);
        const defaultPlugins = isBrowserWindow()
            ? window.plugins
            : global.plugins;
        return plugins || defaultPlugins;
    }, domain.name);

    const refreshPlugins = async () => {
        const plugins = await getPlugins();
        setState({ plugins });
    };

    useRegisterHandle(
        'plugin-manager.handle',
        () => {
            return {
                refreshPlugins,
            };
        },
        [],
    );

    useEffect(() => {
        refreshPlugins();
    }, [pluginId]);

    const groups = {};
    Reactium.Plugin.Groups.list.forEach(
        ({ id, label }) => (groups[id] = label),
    );

    const allPlugins = plugins.map(plugin => {
        const group = op.get(plugin, 'meta.group', 'other');
        return {
            ...plugin,
            group,
            groupName: op.get(groups, group, groups.other),
        };
    });

    const idx = lunr(function() {
        const lnr = this;
        lnr.ref('ID');
        lnr.field('name');
        lnr.field('description');
        allPlugins.forEach(plugin => lnr.add(plugin));
    });

    const renderManager = () => {
        if (!pluginId)
            return (
                <PluginList
                    groups={groups}
                    plugins={allPlugins}
                    idx={idx}
                    canView={canView}
                    canActivate={canActivate}
                />
            );
        return (
            <PluginSettings
                plugin={allPlugins.find(plugin => plugin.ID === pluginId)}
            />
        );
    };

    const render = () => {
        return <div className={'plugin-manager'}>{renderManager()}</div>;
    };

    return render();
});

export default PluginManager;
