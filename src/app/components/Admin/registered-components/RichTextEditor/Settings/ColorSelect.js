import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { isLight } from './utils';
import PropTypes from 'prop-types';
import { useEditor } from 'slate-react';
import React, { forwardRef, useImperativeHandle, useEffect } from 'react';

import Reactium, {
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useRefs,
} from 'reactium-core/sdk';

const noop = () => {};

const Swatch = ({
    active,
    className,
    label,
    onClick,
    disabled,
    value,
    ...props
}) => (
    <div
        className={cn('swatch', className, {
            light: value && isLight(value),
            disabled,
            active,
        })}
        onClick={!disabled ? onClick : noop}
        style={{ backgroundColor: value }}
        title={label}
        {...props}
    />
);

let ColorSelect = (
    {
        className,
        colors: initialColors,
        editable,
        name,
        namespace,
        onChange,
        placeholder,
        value: initialValue,
        ...props
    },
    ref,
) => {
    const refs = useRefs();

    const editor = useEditor();

    const [state, update] = useDerivedState({
        colors: editor.colors,
        value: initialValue,
    });

    const setState = newState => {
        if (unMounted()) return;
        update(newState);
    };

    const _onChange = value => {
        const evt = new ComponentEvent('change', { value });
        const input = refs.get('input');
        if (input) input.value = value;
        handle.value = value;
        handle.dispatchEvent(evt);
        onChange(evt);
        setState({ value });
    };

    const refreshHandle = () => {
        if (unMounted()) return;
        const newHandle = _handle();
        Object.entries(newHandle).forEach(([key, val]) =>
            op.set(handle, key, val),
        );
        setHandle(handle);
    };

    const setValue = value => _onChange(value);

    const unMounted = () => !refs.get('container');

    const colors = () => {
        let colors = Array.from(editor.colors);
        Reactium.Hook.runSync('rte-colors', colors);

        return colors;
    };

    const _handle = () => ({
        colors,
        props,
        setState,
        setValue,
        state,
        value: state.value,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useEffect(refreshHandle, [state.value]);

    useEffect(() => {
        if (state.value === initialValue) return;
        setState({ value: initialValue });
    }, [initialValue]);

    useEffect(() => {
        if (!Array.isArray(initialColors)) return;
        if (_.isEqual(state.colors, initialColors)) return;
        setState({ colors: initialColors });
    }, [initialColors]);

    return (
        <div
            className={cn(namespace, className, { editable })}
            ref={elm => refs.set('container', elm)}>
            <input
                type='hidden'
                name={name}
                defaultValue={state.value}
                ref={elm => refs.set('input', elm)}
            />
            {editable && (
                <div className='ar-color-select-input'>
                    <Swatch value={state.value} label={state.value} disabled />
                    <input
                        type='text'
                        placeholder={placeholder}
                        value={state.value || ''}
                        onChange={e => setValue(e.target.value)}
                    />
                </div>
            )}
            <div className='ar-color-select-swatches'>
                {colors().map(item => (
                    <Swatch
                        onClick={() => setValue(item.value)}
                        active={state.value === item.value}
                        key={`color-${item.value}`}
                        {...item}
                    />
                ))}
            </div>
        </div>
    );
};

ColorSelect = forwardRef(ColorSelect);

ColorSelect.propTypes = {
    className: PropTypes.string,
    colors: PropTypes.array,
    editable: PropTypes.bool,
    name: PropTypes.string,
    onChange: PropTypes.func,
    placeholder: PropTypes.string,
    value: PropTypes.string,
};

ColorSelect.defaultProps = {
    editable: false,
    name: 'color',
    namespace: 'ar-color-select',
    placeholder: '#000000',
    onChange: noop,
};

export { ColorSelect, ColorSelect as default };
