import _ from 'underscore';
import op from 'object-path';
import { useEditor } from 'slate-react';

import {
    __,
    ComponentEvent,
    useEventHandle,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from 'react';

const noop = () => {};

const INIT = 'init';
const READY = 'ready';

let TextAlignSelect = (props, ref) => {
    const editor = useEditor();

    const refs = useRefs();

    const { onChange, name, title } = props;

    const [, setStatus, isStatus] = useStatus(INIT);

    const [value, setValue] = useState();

    const buttons = () => {
        const buttonList = _.where(editor.buttons, { formatter: 'alignment' });
        return typeof props.buttonFilter === 'function'
            ? buttonList.filter(props.buttonFilter)
            : buttonList;
    };

    const _onChange = () => {
        if (isStatus(INIT)) return;
        const evt = new ComponentEvent('change', { value });
        const input = refs.get('value');
        if (input) input.value = value;
        handle.value = value;
        handle.dispatchEvent(evt);
        onChange(evt);
        updateHandle();
    };

    const _handle = () => ({
        props,
        setValue,
        value,
    });

    const [handle, setHandle] = useEventHandle(_handle());
    const updateHandle = (overrides = {}) => {
        const newHandle = _handle();

        Object.entries(overrides).forEach(([key, val]) =>
            op.set(newHandle, key, val),
        );

        Object.entries(newHandle).forEach(([key, val]) =>
            op.set(handle, key, val),
        );

        setHandle(handle);
    };

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        if (_.isEqual(value, props.value)) return;
        setValue(props.value);
        _.defer(() => setStatus(READY, true));
    }, [props.value]);

    useEffect(_onChange, [value]);

    return (
        <>
            <h3 className='heading'>{title}</h3>
            <div className='formatter-text-align'>
                <input
                    type='hidden'
                    defaultValue={value}
                    name={name}
                    ref={elm => refs.set('value', elm)}
                />
                <div className='btn-group'>
                    {buttons().map(({ id, button: Button }) => (
                        <Button
                            active={id === value}
                            onClick={() => setValue(id)}
                            data-align={id}
                            key={id}
                            size='sm'
                            color='clear'
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

TextAlignSelect = forwardRef(TextAlignSelect);

TextAlignSelect.defaultProps = {
    buttonFilter: null,
    onChange: noop,
    name: 'align',
    title: __('Alignment'),
    value: 'align-left',
};

export { TextAlignSelect, TextAlignSelect as default };
