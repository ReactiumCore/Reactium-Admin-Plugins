import React from 'react';
import Reactium, { __, useHandle } from 'reactium-core/sdk';
import { Plugins } from 'reactium-core/components/Plugable';
import op from 'object-path';
import cn from 'classnames';
import { Toggle } from '@atomic-reactor/reactium-ui';

const Card = ({ plugin }) => {
    const core =
        op.get(plugin, 'meta.builtIn', false) && plugin.group === 'core';
    const defaultGraphic = core
        ? '/assets/images/atomic-reactor-logo.svg'
        : '/assets/images/plugin.svg';
    const graphic = op.get(plugin, 'meta.graphic', defaultGraphic);
    const { name, description, active, group } = plugin;

    const { refreshPlugins } = useHandle('plugin-manager.handle');

    const toggleActivate = async () => {
        const { ID } = plugin;
        if (plugin.active) {
            await Reactium.Cloud.run('plugin-deactivate', { plugin: ID });
        } else {
            await Reactium.Cloud.run('plugin-activate', { plugin: ID });
        }

        await refreshPlugins();
    };

    const renderActivation = () => {
        const hideControl =
            !Reactium.User.canSync([
                'plugin.activate',
                `${plugin.ID}.activate`,
            ]) || group === 'core';
        return (
            <>
                <div className='plugin-card-status'>
                    <strong>
                        {active ? __('Plugin Active') : __('Plugin Disabled')}
                    </strong>
                </div>
                {!hideControl && (
                    <div className='plugin-card-toggle'>
                        <Toggle
                            label={
                                plugin.active
                                    ? __('Deactivate')
                                    : __('Activate')
                            }
                            defaultChecked={plugin.active}
                            onChange={toggleActivate}
                        />
                    </div>
                )}
            </>
        );
    };

    const render = () => {
        return (
            <div className={cn('plugin-card', { 'plugin-card--core': core })}>
                <div className='plugin-card__graphic'>
                    <img src={graphic} alt={plugin.name} />
                </div>
                <div className='plugin-card__details'>
                    {!!name && <h3>{name}</h3>}
                    {!!description && <p className='mt-8'>{description}</p>}
                    <Plugins zone='plugin-card-description' plugin={plugin} />
                </div>
                <div className='plugin-card__actions'>
                    {renderActivation()}
                    <Plugins zone='plugin-card-actions' plugin={plugin} />
                </div>
            </div>
        );
    };

    return render();
};

export default Card;
