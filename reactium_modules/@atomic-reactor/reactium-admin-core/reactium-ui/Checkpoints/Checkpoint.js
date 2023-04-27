/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Checkpoint
 * -----------------------------------------------------------------------------
 */
const cn = ({ className, disabled, label, labelAlign }) => {
    const lbl = `ar-checkpoint-label-${labelAlign}`;
    return classnames({
        [className]: !!className,
        [lbl]: !!label,
        disabled,
        'ar-checkpoint': true,
    });
};

const Checkpoint = ({
    children,
    className,
    label,
    labelAlign,
    labelStyle,
    name,
    style,
    title,
    ...inputProps
}) => (
    <label
        style={style}
        title={title}
        aria-label={label}
        aria-labelledby={!label && name}
        className={cn({
            labelAlign,
            label,
            className,
            disabled: inputProps.disabled,
        })}>
        <span
            className={classnames({
                'sr-only': !label,
                label: !!label,
            })}
            style={labelStyle}>
            {label || title || name}
        </span>
        <input name={name} {...inputProps} />
        <span className='icon'>{children}</span>
    </label>
);

Checkpoint.ALIGN_TOP = 'top';
Checkpoint.ALIGN_BOTTOM = 'bottom';
Checkpoint.TYPE_CHECKBOX = 'checkbox';
Checkpoint.TYPE_RADIO = 'radio';

Checkpoint.propTypes = {
    className: PropTypes.string,
    id: PropTypes.string,
    label: PropTypes.any,
    labelAlign: PropTypes.oneOf([
        Checkpoint.ALIGN_TOP,
        Checkpoint.ALIGN_BOTTOM,
    ]),
    labelStyle: PropTypes.object,
    name: PropTypes.string,
    qaId: PropTypes.string,
    style: PropTypes.object,
    title: PropTypes.string,
    type: PropTypes.oneOf([Checkpoint.TYPE_CHECKBOX, Checkpoint.TYPE_RADIO]),
};

Checkpoint.defaultProps = {
    labelAlign: Checkpoint.ALIGN_BOTTOM,
    type: Checkpoint.TYPE_CHECKBOX,
};

export default Checkpoint;
