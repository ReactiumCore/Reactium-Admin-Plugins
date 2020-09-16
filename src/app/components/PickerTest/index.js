import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: PickerTest
 * -----------------------------------------------------------------------------
 */

class Editor extends EventTarget {
    isNew() {
        return true;
    }

    unMounted() {
        return false;
    }
}

const PickerTest = props => {
    const MediaTool = useHookComponent('MediaTool');

    return (
        <div
            style={{
                width: '100vw',
                height: '100vh',
                padding: '60px 40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
            <MediaTool editor={new Editor()} />
        </div>
    );
};

export default PickerTest;
