/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Toggle from 'reactium-ui/Toggle';
import { Feather } from 'reactium-ui/Icon';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Checkbox
 * -----------------------------------------------------------------------------
 */

const ENUMS = Toggle.ENUMS;

const cn = ({ className, color = ENUMS.COLOR.PRIMARY, label, labelAlign }) => {
    const lbl = `ar-checkbox-label-${labelAlign}`;
    const clr = `ar-checkbox-${color}`;

    return classnames({
        [className]: !!className,
        [lbl]: !!label,
        [clr]: true,
        'ar-checkbox': true,
    });
};

let Checkbox = (
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
            <span>
                <Feather.Check width={14} height={14} />
            </span>
        </label>
    );
};

Checkbox = forwardRef(Checkbox);

Checkbox.ENUMS = ENUMS;

Checkbox.propTypes = { ...Toggle.propTypes, readOnly: PropTypes.bool };

Checkbox.defaultProps = {
    ...Toggle.defaultProps,
    readOnly: false,
    type: ENUMS.TYPE.CHECKBOX,
};

export { Checkbox, Checkbox as default };
