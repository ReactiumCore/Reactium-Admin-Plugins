import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PickerTest
 * -----------------------------------------------------------------------------
 */
const PickerTest = props => {
    const MediaTool = useHookComponent('MediaTool');

    return <MediaTool max={10} directory={'uploads'} value={[]} />;
};

export default PickerTest;
