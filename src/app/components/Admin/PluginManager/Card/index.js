import React from 'react';
import { __ } from 'reactium-core/sdk';
import { Plugins } from 'reactium-core/components/Plugable';
import op from 'object-path';
import cn from 'classnames';

const Card = ({ plugin }) => {
    const core =
        op.get(plugin, 'meta.builtIn', false) && plugin.group === 'core';
    const defaultGraphic = core
        ? '/assets/images/atomic-reactor-logo.svg'
        : '/assets/images/plugin.svg';
    const graphic = op.get(plugin, 'meta.graphic', defaultGraphic);
    const { name, description, active, group } = plugin;
    console.log({ plugin });
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
                    {group === 'core' && (
                        <strong>
                            {active ? __('Active') : __('Disabled')}
                        </strong>
                    )}
                    <Plugins zone='plugin-card-actions' plugin={plugin} />
                </div>
            </div>
        );
    };

    return render();
};

export default Card;
