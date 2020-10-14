import op from 'object-path';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import {
    __,
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useHookComponent,
} from 'reactium-core/sdk';

const noop = () => {};

const Swatch = ({ id, color }) => (
    <div style={{ width: '100%' }} className='flex middle' title={id}>
        <span
            style={{
                border: '1px solid #F3F3F3',
                backgroundColor: color,
                borderRadius: 2,
                marginRight: 12,
                height: 16,
                width: 16,
            }}
        />
        {String(color).toUpperCase()}
    </div>
);

const ColorSelect = forwardRef(({ onChange = noop, ...props }, ref) => {
    let { defaultValue = '#000000', label, name, options = [], value } = props;

    const { Button, Dropdown, Icon } = useHookComponent('ReactiumUI');

    const formatValue = val =>
        String(val)
            .toUpperCase()
            .replace(/RGBA/g, 'rgba')
            .replace(/RGB/g, 'rgb');

    const [state, setState] = useDerivedState({
        defaultValue: formatValue(defaultValue),
        value: formatValue(value),
    });

    const _onChange = e => setState({ value: formatValue(e.target.value) });

    const _onSelect = e => setState({ value: formatValue(e.item.color) });

    const _onRestore = () => setState({ value: state.defaultValue });

    const data = options.map(item => ({
        ...item,
        label: <Swatch {...item} />,
    }));

    const _handle = () => ({
        ...props,
        data,
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
                        <Dropdown
                            data={data}
                            valueField='color'
                            onItemSelect={_onSelect}
                            className='block'
                            selection={[state.value]}>
                            <input
                                name={name}
                                value={String(state.value).toUpperCase()}
                                onChange={_onChange}
                                style={{
                                    margin: 0,
                                    paddingRight: 50,
                                    paddingLeft: 40,
                                    width: '100%',
                                    height: 42,
                                }}
                            />
                            {state.defaultValue !== state.value && (
                                <Button
                                    className='hover-show'
                                    color={Button.ENUMS.COLOR.CLEAR}
                                    onClick={() => _onRestore()}
                                    title={__('restore default')}
                                    style={{
                                        width: 42,
                                        height: 42,
                                        padding: 0,
                                        position: 'absolute',
                                        left: -50,
                                        top: 0,
                                    }}>
                                    <Icon
                                        name='Feather.RefreshCcw'
                                        size={14}
                                        style={{ fill: '#666666' }}
                                    />
                                </Button>
                            )}
                            <Button
                                color={Button.ENUMS.COLOR.CLEAR}
                                data-dropdown-element
                                style={{
                                    width: 42,
                                    height: 42,
                                    padding: 0,
                                    position: 'absolute',
                                    right: 2,
                                    top: 0,
                                }}>
                                <Icon
                                    name='Feather.ChevronDown'
                                    size={24}
                                    style={{ fill: '#666666' }}
                                />
                            </Button>
                            <span
                                style={{
                                    border: '1px solid #F3F3F3',
                                    backgroundColor: state.value,
                                    borderRadius: 2,
                                    marginRight: 12,
                                    transform: 'translate(-50%, -50%)',
                                    position: 'absolute',
                                    top: '50%',
                                    left: 22,
                                    height: 16,
                                    width: 16,
                                }}
                            />
                        </Dropdown>
                    </div>
                </div>
            </div>
        </div>
    );
});

export { ColorSelect, ColorSelect as default };
