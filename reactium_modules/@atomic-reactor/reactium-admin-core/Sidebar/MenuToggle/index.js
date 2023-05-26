import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import op from 'object-path';
import { Icon } from 'reactium-ui';
import Reactium, { useHandle } from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Component: Toggle
 * Hide/Show the Admin Sidebar
 * -----------------------------------------------------------------------------
 */

const Toggle = () => {
    const Sidebar = useHandle('AdminSidebar');

    const [expanded, setExpanded] = useState(Sidebar.isExpanded());

    const update = () => {
        setExpanded(Sidebar.isCollapsed());
    };

    useEffect(() => {
        if (!Sidebar) return;
        Sidebar.addEventListener('toggle', update);

        return () => {
            Sidebar.removeEventListener('toggle', update);
        };
    }, [Sidebar]);

    const render = () => {
        return !Sidebar ? null : (
            <button
                className={cn(Sidebar.cx('toggle'), { expanded })}
                onClick={() => Sidebar.toggle()}
                type='button'
            >
                <div className='button'>
                    {expanded && (
                        <Icon
                            name='Feather.X'
                            className='show-xs-only hide-sm'
                        />
                    )}
                    {expanded && (
                        <Icon
                            name='Feather.MoreVertical'
                            className='hide-xs-only'
                        />
                    )}
                    {!expanded && <Icon name='Feather.Menu' />}
                </div>
            </button>
        );
    };

    return render();
};

export { Toggle as default };
