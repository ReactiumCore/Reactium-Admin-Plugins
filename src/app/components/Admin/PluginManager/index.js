import React, { useEffect } from 'react';
import op from 'object-path';
import Reactium, {
    __,
    useReduxState,
    useRegisterHandle,
    useCapabilityCheck,
} from 'reactium-core/sdk';
import PluginList from './List';
import PluginSettings from './Settings';
import domain from './domain';
import lunr from 'lunr';

const getPlugins = async () => {
    const { plugins } = await Reactium.Cloud.run('plugins');
    return plugins;
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PluginManager
 * -----------------------------------------------------------------------------
 */
const PluginManager = props => {
    const canView = useCapabilityCheck(['plugins-ui.view']);
    const canActivate = useCapabilityCheck(['plugins.activate']);

    const [state, setState] = useReduxState(state => {
        const pluginId = op.get(state, 'Router.match.params.id');
        const { plugins } = op.get(state, domain.name, []);
        return { pluginId, plugins };
    }, domain.name);

    const { pluginId, plugins } = state;

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

    const groups = {
        core: __('Core'),
        mail: __('Mailers'),
        FilesAdapter: __('File Adapters'),
        utilities: __('Utilities'),
        other: __('Other'),
    };

    Reactium.Hook.run('plugin-group-labels', groups);

    const allPlugins = plugins.map(plugin => {
        const group = op.get(plugin, 'meta.group', 'other');
        return {
            ...plugin,
            group,
            groupName: op.get(groups, group, groups.other),
        };
    });

    const idx = lunr(function() {
        this.ref('ID');
        this.field('name');
        this.field('description');
        allPlugins.forEach(plugin => this.add(plugin));
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
};

export default PluginManager;
