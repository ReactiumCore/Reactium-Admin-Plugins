import React from 'react';
import { Spinner } from '@atomic-reactor/reactium-ui';

export default () => {
    const style = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100vh - 60px)',
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={style} className='flex center middle'>
                <Spinner />
            </div>
        </div>
    );
};
