import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { useRegisterHandle } from 'reactium-core/sdk';
import { Modal, Toast, Tooltip } from '@atomic-reactor/reactium-ui';

import React, {
    forwardRef,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

/**
 * -----------------------------------------------------------------------------
 * Hook Component: Tools
 * -----------------------------------------------------------------------------
 */
let Tools = (props, ref) => {
    const tooltipRef = useRef();

    const handle = () => ({
        Tooltip: tooltipRef.current,
    });

    // External Interface
    useRegisterHandle('AdminTools', handle);
    useImperativeHandle(ref, handle);

    // Render
    return (
        <>
            <Tooltip ref={tooltipRef} />
        </>
    );
};

Tools = forwardRef(Tools);

export { Tools as default };
