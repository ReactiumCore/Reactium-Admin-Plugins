import React, { useEffect } from 'react';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import Scenes from './Scenes';
import op from 'object-path';

// Notes:
// 1. Stand alone preview for one or more media items
// 2. Picker / Uploader

const MediaTool = ({ editor, max }) => {
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    console.log({ tools, Modal });

    useEffect(() => {
        if (Modal) {
            Modal.show(
                <div style={{ width: '80vw', height: '100vh' }}>
                    <Scenes editor={editor} max={max} />
                </div>,
            );
        }
    });

    return null;
    // <Scenes editor={editor} />;
};

export default MediaTool;
