import React from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default ({ avatar, clear, defaultAvatar, upload }) => (
    <div
        className='flex mb-xs--8'
        style={{ width: '100%', justifyContent: 'space-between' }}>
        <Button
            appearance='circle'
            color='tertiary'
            onClick={upload}
            size='xs'
            title='Upload'
            data-tooltip
            data-vertical-align='middle'
            data-align='left'
            type='button'>
            <Icon
                name={avatar ? 'Feather.Edit2' : 'Feather.Plus'}
                size={avatar ? 16 : 18}
            />
        </Button>
        {avatar && avatar !== defaultAvatar && (
            <Button
                appearance='circle'
                color='danger'
                onClick={clear}
                title='Remove'
                data-tooltip
                data-vertical-align='middle'
                data-align='right'
                size='xs'
                type='button'>
                <Icon name='Feather.X' size={16} />
            </Button>
        )}
    </div>
);
