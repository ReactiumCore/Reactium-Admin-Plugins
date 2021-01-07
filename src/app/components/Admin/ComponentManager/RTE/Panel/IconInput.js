import _ from 'underscore';
import op from 'object-path';
import React, { useEffect, useState } from 'react';
import {
    useHookComponent,
    useIsContainer,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const noop = () => {};

const IconInput = ({ onChange = noop, ...props }) => {
    const name = op.get(props, 'name');
    let ico = op.get(props, 'defaultValue');
    ico = !ico ? 'Feather.Star' : ico;
    ico = String(ico).includes('.') ? ico : 'Feather.Star';

    const refs = useRefs();

    const [, setStatus, isStatus] = useStatus();

    const isContainer = useIsContainer();

    const Picker = useHookComponent('IconPicker');
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [visible, updateVisible] = useState(false);

    const _search = s => {
        const picker = refs.get('picker');
        if (!picker) return;
        picker.setSearch(s);
        setVisible(true);

        if (String(s).length < 1) {
            onChange({ target: { name, value: null } });
        }
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

        const input = refs.get('input');
        if (input) input.value = ico;

        setVisible(false);

        onChange({ target: { name, value: ico } });
    };

    const _onFocus = () => setVisible(true);

    const _onBlur = e => {
        const container = refs.get('container');
        if (container && isContainer(e.target, container)) {
            return;
        } else {
            setVisible(false);
        }
    };

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
        <div className='input-button' ref={elm => refs.set('container', elm)}>
            <div className='fieldset'>
                <input
                    {...props}
                    type='text'
                    onFocus={_onFocus}
                    ref={elm => refs.set('input', elm)}
                    onChange={e => search(e.target.value)}
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
                    ref={elm => refs.set('picker', elm)}
                />
            </div>
        </div>
    );
};

export { IconInput, IconInput as default };
