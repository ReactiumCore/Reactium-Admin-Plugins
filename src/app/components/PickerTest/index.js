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
            <MediaTool
                max={1}
                value={[
                    {
                        objectId: 'stBGUYe906',
                        url:
                            '/media/uploads/screen-shot-2020-09-10-at-4.13.33-pm.png',
                        delete: true,
                    },
                    {
                        objectId: 'stBGUYe906',
                        url:
                            '/media/uploads/screen-shot-2020-09-10-at-4.13.33-pm.png',
                        delete: true,
                    },
                    {
                        objectId: 'EojbdUXJbW',
                        url:
                            '/media/uploads/screen-shot-2020-09-19-at-12.29.14-am.png',
                    },
                ]}
            />
        </div>
    );
};

export default PickerTest;
