import _ from 'underscore';
import op from 'object-path';
import React, { useState } from 'react';
import { useHookComponent, useIsContainer, useStatus } from 'reactium-core/sdk';

const IconInput = ({ handle, ...props }) => {
    const name = op.get(props, 'name');
    let ico = op.get(props, 'defaultValue');
    ico = !ico ? 'Feather.Star' : ico;
    ico = String(ico).includes('.') ? ico : 'Feather.Star';

    const [, setStatus, isStatus] = useStatus();

    const isContainer = useIsContainer();

    const Picker = useHookComponent('IconPicker');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [visible, updateVisible] = useState(false);

    const _search = s => {
        const picker = handle.refs.get(`picker.${name}`);
        if (!picker) return;
        picker.setSearch(s);
        setVisible(true);
    };

    const search = _.throttle(_search, 100);

    const setVisible = val => {
        if (val === true) {
            updateVisible(true);
        } else {
            _.defer(() => updateVisible(false));
        }
    };

    const _onChange = e => {
        if (!isStatus('ready')) {
            setStatus('ready', true);
            return;
        }

        const val = e.target.value;

        const ico = _.chain([val])
            .flatten()
            .first()
            .value();

        if (!ico) return;

        handle.setValue(name, ico);

        const input = handle.refs.get(`input.${name}`);
        if (input) input.value = ico;

        setVisible(false);
    };

    const _onFocus = () => setVisible(true);

    const _onBlur = () => {
        const container = handle.refs.get(`picker.container${name}`);
        if (container && isContainer(container)) {
            return;
        } else {
            setVisible(false);
        }
    };

    return (
        <div
            className='input-button'
            ref={elm => handle.refs.set(`picker.container${name}`, elm)}>
            <div className='fieldset'>
                <input
                    {...props}
                    type='text'
                    onBlur={_onBlur}
                    onFocus={_onFocus}
                    onChange={e => search(e.target.value)}
                    ref={elm => handle.refs.set(`input.${name}`, elm)}
                />
                <Button
                    readOnly
                    color='tertiary'
                    style={{ pointerEvents: 'none' }}>
                    <Icon name={ico} size={20} />
                </Button>
            </div>
            <div className='icons' style={{ display: visible ? null : 'none' }}>
                <Picker
                    onChange={_onChange}
                    ref={elm => handle.refs.set(`picker.${name}`, elm)}
                />
            </div>
        </div>
    );
};

export { IconInput, IconInput as default };
