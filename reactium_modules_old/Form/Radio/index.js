import { Toggle } from '../Toggle';
import React, { forwardRef } from 'react';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Radio
 * -----------------------------------------------------------------------------
 */
const Radio = forwardRef((props, ref) => (
    <Toggle {...props} ref={ref} width={props.size} type={Toggle.TYPE.RADIO} />
));

Radio.propTypes = {
    ...Toggle.propTypes,
};

delete Radio.propTypes.type;

Radio.defaultProps = {
    namespace: 'radio',
    size: Toggle.SIZE.XS,
    value: true,
};

export { Radio };
