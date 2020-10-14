import op from 'object-path';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import {
    ComponentEvent,
    useDerivedState,
    useEventHandle,
} from 'reactium-core/sdk';

const noop = () => {};

const NavSelect = forwardRef(({ onChange = noop, ...props }, ref) => {
    let { label, name, value, options = [] } = props;

    const [state, setState] = useDerivedState({
        value,
    });

    const _onChange = e => setState({ value: e.target.value });

    const _handle = () => ({
        ...props,
        data: options,
        state,
        setState,
        value: state.value,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        const evt = new ComponentEvent('change', {
            previous: handle.value,
            value: state.value,
        });
        op.set(handle, 'value', state.value);
        onChange(evt);
        setHandle(handle);
    }, [state.value]);

    return (
        <div className='pr-xs-20 pb-xs-20'>
            <div className='form-group'>
                <div className='row' style={{ alignItems: 'center' }}>
                    <div className='col-xs-12 col-sm-7 col-md-8 col-lg-10'>
                        <label htmlFor={name}>
                            <span aria-label={label}>{label}</span>
                        </label>
                    </div>
                    <div className='col-xs-12 col-sm-5 col-md-4 col-lg-2'>
                        <select
                            id={name}
                            name={name}
                            value={state.value}
                            style={{ width: '100%' }}
                            onChange={_onChange}>
                            <option value={null}>Select</option>
                            {options.map(({ slug, title }) => (
                                <option value={slug} key={slug}>
                                    {title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
});

export { NavSelect, NavSelect as default };
