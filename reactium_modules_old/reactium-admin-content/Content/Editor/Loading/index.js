import React, { forwardRef } from 'react';
import { Spinner } from '@atomic-reactor/reactium-ui';

export default forwardRef((props, ref) => {
    const style = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100vh - 60px)',
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <div style={style} className='flex center middle'>
                <Spinner />
            </div>
        </div>
    );
});
