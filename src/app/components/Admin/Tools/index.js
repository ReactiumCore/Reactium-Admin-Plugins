import Reactium, {
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

    const onKeyDown = e => Reactium.Hotkeys.onKeyboardEvent(e);

    const dismissModal = e => {
        if (!modalRef.current) return;
        e.preventDefault();
        handle.Modal.hide();
        return false;
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

    useEffect(() => {
        handle.Modal = modalRef.current;
        handle.Tooltip = tooltipRef.current;
    });

    useEffect(() => {
        Reactium.Hotkeys.register('modal-esc', {
            callback: dismissModal,
            key: 'esc',
            order: Reactium.Enums.priority.lowest,
            scope: document,
        });

        return () => {
            Reactium.Hotkeys.unregister('modal-esc');
        };
    }, []);

    // Register keyboard hotkey listener
    useEffect(() => {
        if (!modalRef.current) return;
        if (typeof window === 'undefined') return;

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [Modal]);

    // External Interface
    useRegisterHandle('AdminTools', handle);
    useImperativeHandle(ref, handle);

    // Render
    return (
        <>
            <Modal ref={modalRef} />
            <Tooltip ref={tooltipRef} />
            <Toast />
        </>
    );
};

Tools = forwardRef(Tools);

export { Tools as default };
