import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

const DragHandle = ({ bind = {} }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    return (
        <div className='list-drag-handle' {...bind}>
            <Icon name={'Linear.Move'} />
            <span className='sr-only'>{__('Click to Drag')}</span>
        </div>
    );
};

export default DragHandle;
