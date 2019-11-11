import { useRegisterHandle } from 'reactium-core/sdk';
import { Modal, Toast, Tooltip } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

let Tools = (props, ref) => {
    const modalRef = useRef();
    const tooltipRef = useRef();

    const handle = () => ({
        Modal: modalRef.current,
        Tooltip: tooltipRef.current,
        Toast,
    });

    // External Interface
    useRegisterHandle('AdminTools', handle);
    useImperativeHandle(ref, handle);

    // Render
    return (
        <>
            <Toast />
            <Modal ref={modalRef} />
            <Tooltip ref={tooltipRef} />
        </>
    );
};

Tools = forwardRef(Tools);

export { Tools as default };
