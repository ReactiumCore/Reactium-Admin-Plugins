import React from 'react';
import cn from 'classnames';
import { useHookComponent } from 'reactium-core/sdk';

export default props => {
    const { Icon } = useHookComponent('ReactiumUI');
    const { children, color = 'blue', icon = 'Feather.DownloadCloud' } = props;

    return (
        <div className='flex'>
            <span className={cn('mr-xs-4', 'mt-xs-2', color)}>
                <Icon name={icon} size={22} />
            </span>
            <div style={{ lineHeight: 1 }}>{children}</div>
        </div>
    );
};
