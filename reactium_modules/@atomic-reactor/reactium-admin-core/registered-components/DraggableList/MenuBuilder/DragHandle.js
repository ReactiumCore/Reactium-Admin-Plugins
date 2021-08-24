import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

const DragHandle = ({ bind = {} }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <div className='list-drag-handle' {...bind}>
            <Button
                color={Button.ENUMS.COLOR.CLEAR}
                readOnly
                className='ar-dialog-header-btn'
                style={{ padding: 0, width: 42, height: 42 }}>
                <Icon name={'Linear.Move'} />
            </Button>
            <span className='sr-only'>{__('Click to Drag')}</span>
        </div>
    );
};

export default DragHandle;
