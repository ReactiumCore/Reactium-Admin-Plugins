import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Scrollbars } from 'react-custom-scrollbars';

import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import Reactium, {
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useIsContainer,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const noop = () => {};

let ColorPicker = (
    {
        maxHeight,
        minHeight,
        namespace,
        onBlur = noop,
        onFocus = noop,
        onChange = noop,
        onKeyUp = noop,
        value: initialValue,
        visible: initialVisible,
        ...props
    },
    ref,
) => {
    const refs = useRefs();

    const [status, setStatus, isStatus] = useStatus();

    const [state, update] = useDerivedState({
        value: props.defaultValue || initialValue,
        visible: initialVisible,
    });

    const setState = (k, v) => {
        if (unMounted()) return;
        const newState = _.isString(k) ? { [k]: v } : k;
        update(newState);
    };

    const setValue = v => setState('value', v);

    const setVisible = v => setState('visible', v);

    const dispatch = (e, eventObj) => {
        const evt = new ComponentEvent(e, eventObj);
        handle.dispatchEvent(evt);
        return evt;
    };

    const isContainer = useIsContainer();

    const hide = () => setVisible(false);

    const show = () => setVisible(true);

    const toggle = () => setVisible(!state.visible);

    const _onBlur = e => {
        const container = refs.get('container');
        if (container && isContainer(e.target, container)) {
            return;
        } else {
            setVisible(false);
            onBlur(e);
        }
    };

    const _onChange = e => setValue(e.target.value);

    const _onFocus = e => {
        setVisible(true);
        onFocus(e);
    };

    const _onKeyUp = e => {
        let v = e.target.value;
        if (String(v).startsWith('#')) {
            v = String(v).toUpperCase();
        }

        e.target.value = v;

        onKeyUp(e);
    };

    const _onSelect = v => () => {
        setValue(v);
        hide();
    };

    const _value = () => {
        let val = !_.chain([op.get(state, 'value')])
            .flatten()
            .compact()
            .isEmpty()
            .value()
            ? state.value
            : ColorPicker.defaultProps.value;

        val = String(val).startsWith('#') ? String(val).toUpperCase() : val;

        return val;
    };

    const colors = () => Object.values(Reactium.RTE.colors);

    const unMounted = () => !refs.get('container');

    const _handle = () => ({
        blur: hide,
        colors: colors(),
        dispatch,
        focus: show,
        hide,
        isStatus,
        props,
        refs,
        show,
        setState,
        setStatus,
        setValue,
        setVisible,
        state,
        status,
        toggle,
        unMounted,
        value: _value(),
    });

    const [handle, updateHandle] = useEventHandle(_handle());
    const setHandle = newHandle => {
        if (unMounted()) return;
        updateHandle(newHandle);
    };

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        const newValue = _value();

        if (handle.value !== newValue) {
            handle.value = newValue;
            if (!isStatus('pending')) {
                onChange(dispatch('change', { value: handle.value }));
            }

            const input = refs.get('input');
            if (input && input.value !== handle.value) {
                input.value = handle.value;
            }

            setHandle(handle);
        }
    }, [state.value]);

    useEffect(() => {
        dispatch('status', { status, isStatus, setStatus });

        switch (status) {
            case 'pending':
                setStatus('ready', true);
                break;
        }
    }, [status]);

    useEffect(() => {
        if (!window) return;
        window.addEventListener('mousedown', _onBlur);
        window.addEventListener('touchstart', _onBlur);

        return () => {
            window.removeEventListener('mousedown', _onBlur);
            window.removeEventListener('touchstart', _onBlur);
        };
    }, []);

    return (
        <div className={cn(namespace)} ref={elm => refs.set('container', elm)}>
            <div className='fieldset'>
                <input
                    {...props}
                    type='text'
                    onFocus={_onFocus}
                    onKeyUp={_onKeyUp}
                    onChange={_onChange}
                    defaultValue={state.value}
                    ref={elm => refs.set('input', elm)}
                />
                <Swatch value={_value()} disabled />
            </div>
            <div
                className='ar-color-select'
                style={{ display: !state.visible ? 'none' : null }}>
                <Scrollbars
                    autoHeight
                    autoHeightMax={maxHeight}
                    autoHeightMin={minHeight}>
                    <div className='ar-color-select-swatches'>
                        {colors().map((item, i) => (
                            <Swatch
                                onClick={_onSelect(item.value)}
                                active={state.value === item.value}
                                key={`color-${item.value}-${i}`}
                                {...item}
                            />
                        ))}
                    </div>
                </Scrollbars>
            </div>
        </div>
    );
};

ColorPicker = forwardRef(ColorPicker);

ColorPicker.defaultProps = {
    maxHeight: 256,
    minHeight: 48,
    namespace: 'input-button',
    value: '#000000',
    visible: false,
};

const Swatch = ({
    active,
    className,
    label,
    onClick = noop,
    disabled,
    value,
    ...props
}) => (
    <div
        className={cn('swatch', className, {
            light: value && Reactium.RTE.isLight(value),
            disabled,
            active,
        })}
        onClick={!disabled ? onClick : noop}
        style={{ backgroundColor: value }}
        title={label || value}
        {...props}
    />
);

export { ColorPicker, ColorPicker as default };
// <div style={{display: !state.visible ? 'none' : null }}>
