/**
 * -----------------------------------------------------------------------------
 * Imports
 * -----------------------------------------------------------------------------
 */
import _ from 'underscore';
import op from 'object-path';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Toggle from 'reactium-ui/Toggle';
import { Feather } from 'reactium-ui/Icon';
import { elementShim } from './elementShim';

import React, {
    forwardRef,
    useEffect,
    useMemo,
    useImperativeHandle,
} from 'react';

import {
    useDispatcher,
    useRefs,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

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
    const refs = useRefs();

    const state = useSyncState({
        ...props,
        className,
        id,
        label,
        labelAlign,
        labelStyle,
        name,
        style,
        title,
        checked: op.get(props, 'checked', op.get(props, 'defaultChecked')),
        value: op.get(props, 'value', op.get('defaultValue')),
    });

    const inp = () => refs.get('input');

    const lbl = () => refs.get('label');

    const dispatch = useDispatcher({ props, state });

    const _onChange = (e) => {
        state.value = e.target.value;
        state.checked = e.target.checked;

        state.set('value', e.target.value);
        state.set('checked', e.target.checked);

        dispatch(e.type, { value: e.target.value, checked: e.target.checked });
    };

    state.extend('blur', () => {
        lbl().blur();
        dispatch('blur');
        return state;
    });

    state.extend('focus', () => {
        lbl().focus();
        dispatch('focus');
        return state;
    });

    state.extend('check', () => {
        inp().checked = true;
        state.checked = true;
        dispatch('checked');
        dispatch('change', {
            value: state.get('value'),
            checked: state.get('checked'),
        });
        return state;
    });

    state.extend('uncheck', () => {
        inp().checked = false;
        state.checked = false;
        dispatch('unchecked');
        dispatch('change', {
            value: state.get('value'),
            checked: state.get('checked'),
        });
        return state;
    });

    state.extend('toggle', () => {
        const input = inp();
        input.checked = !input.checked;
        state.checked = input.checked;

        dispatch(input.checked ? 'checked' : 'unchecked');
        dispatch('toggle', {
            value: state.get('value'),
            checked: state.get('checked'),
        });
        dispatch('change');

        return state;
    });

    state.id = id;

    state.name = name;

    state.input = refs.get('input');

    state.label = refs.get('label');

    state.value = useMemo(() => state.get('value'), [state.get('value')]);

    state.checked = useMemo(() => state.get('checked'), [state.get('checked')]);

    useEffect(() => {
        state.checked = state.get('checked');
    }, [state.get('checked')]);

    useEffect(() => {
        state.value = state.get('value');
    }, [state.get('value')]);

    useImperativeHandle(ref, () => state);

    return (
        <label
            aria-label={label}
            aria-labelledby={!label && name}
            ref={(elm) => refs.set('label', elm)}
            className={cn({ labelAlign, label, className })}
            style={style}
            title={title}
        >
            <span
                className={classnames({ ['sr-only']: !label })}
                style={labelStyle}
            >
                {label || title || name}
            </span>
            <input
                id={id}
                {...props}
                name={name}
                onChange={_onChange}
                ref={(elm) => {
                    elementShim(elm, state);
                    refs.set('input', elm);
                    state.input = elm;
                    if (elm) state.checked = elm.checked;
                }}
            />
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
