import React from 'react';
import { Dropfile } from '@atomic-reactor/reactium-admin-core/Media/CTE/FieldTypeFile/Uploader/Dropfile';

/**
 * -----------------------------------------------------------------------------
 * Component: Playground
 * -----------------------------------------------------------------------------
 */
export const Playground = () => {
    return (
        <Dropfile
            maxFiles={5}
            onError={console.log}
            onChange={console.log}
            style={{ height: '100vh', width: '100vw' }}
        />
    );
};

export default Playground;
