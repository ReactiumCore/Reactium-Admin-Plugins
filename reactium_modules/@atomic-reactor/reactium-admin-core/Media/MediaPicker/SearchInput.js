import React from 'react';
import cn from 'classnames';
import { __, useHookComponent } from 'reactium-core/sdk';

export default ({ picker }) => {
    const { cx, search, state } = picker;
    const { Icon } = useHookComponent('ReactiumUI');

    return (
        <div className={cx('search-input')}>
            <input
                type='input'
                placeholder={__('Search')}
                defaultValue={state.search || ''}
                onChange={e => search(e.target.value)}
                className={cn({ active: !!state.search })}
            />
            <span className='sib'>
                <Icon name='Feather.Search' className='ico' />
            </span>
        </div>
    );
};
