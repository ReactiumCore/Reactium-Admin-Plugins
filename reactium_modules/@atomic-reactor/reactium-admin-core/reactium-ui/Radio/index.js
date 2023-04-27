/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Toggle from 'reactium-ui/Toggle';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Radio
 * -----------------------------------------------------------------------------
 */

const ENUMS = Toggle.ENUMS;

const cn = ({ className, color = ENUMS.COLOR.PRIMARY, label, labelAlign }) => {
    const lbl = `ar-radio-label-${labelAlign}`;
    const clr = `ar-radio-${color}`;

    return classnames({
        [className]: !!className,
        [lbl]: !!label,
        [clr]: true,
        'ar-radio': true,
    });
};

let Radio = (
    {
        className,
        htmlFor,
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
            <span>
                <span />
            </span>
        </label>
    );
};

Radio = forwardRef(Radio);

Radio.ENUMS = ENUMS;

Radio.propTypes = { ...Toggle.propTypes };

Radio.defaultProps = {
    ...Toggle.defaultProps,
    type: ENUMS.TYPE.RADIO,
};

export { Radio, Radio as default };
