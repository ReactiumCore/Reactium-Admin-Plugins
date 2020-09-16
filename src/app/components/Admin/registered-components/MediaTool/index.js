import React, { useEffect } from 'react';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import Scenes from './Scenes';
import op from 'object-path';

const MediaTool = ({ editor }) => {
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    console.log({ tools, Modal });

    useEffect(() => {
        if (Modal) {
            Modal.show(
                <div style={{ width: '80vw', height: '100vh' }}>
                    <Scenes editor={editor} />
                </div>,
            );
        }
    });

    return null;
    // <Scenes editor={editor} />;
};

export default MediaTool;
