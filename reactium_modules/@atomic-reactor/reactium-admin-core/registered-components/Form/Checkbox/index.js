import { Toggle } from '../Toggle';
import React, { forwardRef } from 'react';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Checkbox
 * -----------------------------------------------------------------------------
 */
const Checkbox = forwardRef((props, ref) => (
    <Toggle
        {...props}
        ref={ref}
        width={props.size}
        type={Toggle.TYPE.CHECKBOX}
    />
));

Checkbox.propTypes = {
    ...Toggle.propTypes,
};

delete Checkbox.propTypes.type;

Checkbox.defaultProps = {
    namespace: 'checkbox',
    size: Toggle.SIZE.XS,
    value: true,
};

export { Checkbox };
