import PropTypes from 'prop-types';
import { useSyncState } from 'reactium-core/sdk';
import React, { forwardRef, useImperativeHandle } from 'react';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Empty
 * -----------------------------------------------------------------------------
 */
let Empty = ({ className }, ref) => {
    const state = useSyncState({});

    useImperativeHandle(ref, () => state);

    return <div className={className}>Empty</div>;
};

Empty = forwardRef(Empty);

Empty.propTypes = {
    className: PropTypes.string,
};

Empty.defaultProps = {
    className: '',
};

export default Empty;
