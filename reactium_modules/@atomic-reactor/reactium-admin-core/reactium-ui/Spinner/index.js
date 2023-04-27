import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import PropTypes from 'prop-types';
import Colors from '../colors';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: spinner
 * -----------------------------------------------------------------------------
 */

const Spinner = ({ className, color, namespace, ...props }) => (
    <div className={cn({ [className]: !!className })} {...props}>
        <div
            className={cn({
                [namespace]: !!namespace,
                [`${namespace}-${color}`]: !!color,
            })}>
            {_.times(8, i => (
                <div key={`ar-spinner-dot-${i}`} />
            ))}
        </div>
    </div>
);

Spinner.ENUMS = {
    COLOR: Object.keys(Colors).reduce((obj, key) => {
        const narr = key.split('-');
        narr.shift();
        obj[String(narr.join('_')).toUpperCase()] = narr.join('-');
        return obj;
    }, {}),
};

Spinner.COLOR = {};

Object.entries(Spinner.ENUMS.COLOR).forEach(
    ([key, value]) => (Spinner.COLOR[key] = value),
);

Spinner.propTypes = {
    className: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    color: PropTypes.oneOf(Object.values(Spinner.COLOR)),
    namespace: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Spinner.defaultProps = {
    color: Spinner.COLOR.BLUE,
    namespace: 'ar-spinner',
};

export { Spinner, Spinner as default };
