import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
import cn from 'classnames';
import Card from '../Card';

const Group = ({ group, groupName, plugins = [] }) => {
    const PluginCard = useHookComponent(
        'plugin-manager-plugin-card',
        Card,
        group,
        groupName,
    );

    return (
        <div className={cn('plugins-group', `plugins-group-${group}`)}>
            <h2>{groupName}</h2>
            <div className='plugins-group-items row'>
                {plugins.map(plugin => (
                    <div
                        key={plugin.ID}
                        className='col-xs-12 col-md-6 col-lg-4'>
                        <PluginCard plugin={plugin} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Group;
