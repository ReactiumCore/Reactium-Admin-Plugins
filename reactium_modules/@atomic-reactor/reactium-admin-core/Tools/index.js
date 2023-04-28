import Reactium, {
    useDocument,
    useStateEffect,
    useSyncState,
    useRefs,
} from 'reactium-core/sdk';

import _ from 'underscore';
import { Modal, Toast, Tooltip } from 'reactium-ui';
import React, { useEffect, useLayoutEffect as useWindowEffect } from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const Tools = () => {
    const refs = useRefs();

    const iDoc = useDocument();

    const state = useSyncState({
        ival: null,
        width: 0,
    });

    const fixHeader = () => {
        let width = state.get('width', 0) || 0;
        const header = iDoc.querySelector('.zone-admin-header');

        if (!header) return;

        const parent = header.parentNode;

        if (!parent) return;

        if (parent.offsetWidth === width) return;

        width = parent.offsetWidth;
        state.set('width', width, true);

        header.style.width = `${width}px`;
    };

    useStateEffect(
        {
            set: e => {
                const p = _.isString(e.path)
                    ? e.path
                    : _.isObject(e.value)
                    ? _.first(Object.keys(e.value))
                    : '';

                if (!String(p).startsWith('Tools')) return;
                Reactium.State.Tools = Reactium.State.get('Tools');
            },
        },
        [],
    );

    useLayoutEffect(() => {
        const ival = state.get('ival');
        if (ival) clearInterval(ival);
        const i = setInterval(fixHeader, 1);
        state.set('ival', i);

        fixHeader();

        return () => clearInterval(i);
    }, []);

    useEffect(() => {
        const Modal = refs.get('Modal');
        const Tooltip = refs.get('Tooltip');
        Reactium.State.set('Tools', { Modal, Toast, Tooltip });
    }, [refs.get('Modal'), refs.get('Tooltip')]);

    return (
        <>
            <Modal ref={elm => refs.set('Modal', elm)} />
            <Tooltip ref={elm => refs.set('Tooltip', elm)} />
            <Toast />
        </>
    );
};

export { Tools as default };
