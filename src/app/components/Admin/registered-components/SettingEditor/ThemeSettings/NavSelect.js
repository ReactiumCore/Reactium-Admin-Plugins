import _ from 'underscore';
import op from 'object-path';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import Reactium, {
    ComponentEvent,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
} from 'reactium-core/sdk';

const noop = () => {};

const NavSelect = forwardRef(({ onChange = noop, ...props }, ref) => {
    let { groupName, label, name, value, options = [] } = props;

    const [state, setState] = useDerivedState({
        value,
    });

    const getMenu = () => {
        let menuData = _.findWhere(options, { slug: state.value }) || {};
        let menuItems = op.get(menuData, 'menu_builder.items', []);
        return menuItems.map(({ depth, id, menu, type }) => ({
            depth,
            id,
            type,
            ...menu,
        }));
    };

    const _onChange = e => setState({ value: e.target.value });

    const _onSubmit = value => {
        const menu = getMenu();
        op.set(value, name, { menu, slug: state.value });
    };

    const _handle = () => ({
        ...props,
        data: options,
        menu: getMenu,
        state,
        setState,
        value: state.value,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        op.set(handle, 'value', state.value);
        setHandle(handle);

        if (options.length < 1) return;

        handle.dispatchEvent(
            new ComponentEvent('change', {
                value: state.value,
            }),
        );
    }, [state.value]);

    useAsyncEffect(async () => {
        const HID = await Reactium.Hook.register(
            `setting-save-${groupName}`,
            _onSubmit,
        );
        return () => {
            Reactium.Hook.unregister(HID);
        };
    }, []);

    useEffect(() => {
        handle.addEventListener('change', onChange);
        return () => {
            handle.removeEventListener('change', onChange);
        };
    }, [handle]);

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
                            value={state.value || ''}
                            style={{ width: '100%' }}
                            onChange={_onChange}>
                            <option value=''>Select</option>
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
