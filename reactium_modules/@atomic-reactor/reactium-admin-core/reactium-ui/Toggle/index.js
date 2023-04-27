/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import ENUMS from './enums';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Toggle
 * -----------------------------------------------------------------------------
 */
const cn = ({ className, color = ENUMS.COLOR.PRIMARY, label, labelAlign }) => {
    const lbl = `ar-toggle-label-${labelAlign}`;
    const clr = `ar-toggle-${color}`;

    return classnames({
        [className]: !!className,
        [lbl]: !!label,
        [clr]: true,
        'ar-toggle': true,
    });
};

let Toggle = (
    {
        className,
        id,
        label,
        labelAlign,
        labelStyle,
        name,
        style,
        title,
        ...props
    },
    ref,
) => {
    const inputRef = useRef();
    const labelRef = useRef();

    useImperativeHandle(ref, () => ({
        blur: () => {
            labelRef.current.blur;
        },
        check: () => {
            inputRef.current.checked = true;
        },
        focus: () => {
            labelRef.current.focus();
        },
        input: inputRef.current,
        label: labelRef.current,
        toggle: () => {
            inputRef.current.checked = !inputRef.current.checked;
        },
        uncheck: () => {
            inputRef.current.checked = false;
        },
        value: inputRef.current.value,
    }));

    return (
        <label
            ref={labelRef}
            aria-label={label}
            aria-labelledby={!label && name}
            className={cn({ labelAlign, label, className })}
            style={style}
            title={title}>
            <span
                className={classnames({ ['sr-only']: !label })}
                style={labelStyle}>
                {label || title || name}
            </span>
            <input ref={inputRef} {...props} id={id} name={name} />
            <span />
        </label>
    );
};

Toggle = forwardRef(Toggle);

Toggle.ENUMS = ENUMS;

Toggle.propTypes = {
    className: PropTypes.string,
    label: PropTypes.any,
    labelAlign: PropTypes.oneOf(Object.values(ENUMS.ALIGN)),
    labelStyle: PropTypes.object,
    style: PropTypes.object,
    title: PropTypes.string,
    type: PropTypes.oneOf(Object.values(ENUMS.TYPE)),
};

Toggle.defaultProps = {
    labelAlign: ENUMS.ALIGN.LEFT,
    type: ENUMS.TYPE.CHECKBOX,
};

export { Toggle, Toggle as default };
