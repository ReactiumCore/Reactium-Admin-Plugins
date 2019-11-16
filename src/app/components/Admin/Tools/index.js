import op from 'object-path';

import {
    useRegisterHandle,
    useDocument,
    useWindowSize,
} from 'reactium-core/sdk';
import { Modal, Toast, Tooltip } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect as useWindowEffect,
    useRef,
    useState,
} from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

let Tools = (props, ref) => {
    const ival = useRef();
    const width = useRef();
    const headerRef = useRef();
    const parentRef = useRef();
    const modalRef = useRef();
    const tooltipRef = useRef();

    const iDoc = useDocument();

    const handle = () => ({
        Modal: modalRef.current,
        Tooltip: tooltipRef.current,
        Toast,
    });

    const fixHeader = () => {
        const header = headerRef.current;
        const parent = parentRef.current;

        if (!header || !parent) {
            return;
        }
        if (parent.offsetWidth === width.current) {
            return;
        }

        width.current = parent.offsetWidth;

        header.style.width = `${width.current}px`;
    };

    useLayoutEffect(() => {
        if (!headerRef.current) {
            headerRef.current = iDoc.querySelector('.zone-admin-header');
        }

        if (headerRef.current && !parentRef.current) {
            parentRef.current = headerRef.current.parentNode;
        }

        fixHeader();
    }, [headerRef.current, parentRef.current, width]);

    useLayoutEffect(() => {
        ival.current = setInterval(fixHeader, 1);
        return () => clearInterval(ival.current);
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
