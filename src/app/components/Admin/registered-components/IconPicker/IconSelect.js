import _ from 'underscore';
import op from 'object-path';
import PropTypes from 'prop-types';
import camelcase from 'camelcase';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import {
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useIsContainer,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const ancestor = (child, selector = 'form') => {
    if (!child || !selector) return null;

    const findAncestor = () => {
        let result = null;
        let parent = child.parentNode;
        while (parent && !result) {
            result = parent.querySelector(selector) || null;
            try {
                parent = parent.parentNode;
            } catch (err) {
                parent = undefined;
            }
        }

        return result;
    };

    return findAncestor();
};

let IconSelect = (props, ref) => {
    const { className, name, style = {}, value: initialValue } = props;

    const refs = useRefs();

    const Picker = useHookComponent('IconPicker');
    const { Icon } = useHookComponent('ReactiumUI');

    const isContainer = useIsContainer();

    const [, setStatus, isStatus] = useStatus();

    const [state, setState] = useDerivedState({
        dataset: {},
        form: ancestor(refs.get('container'), 'form'),
        value: initialValue,
        visible: props.visible,
    });

    const autoHide = e => {
        if (state.visible !== true) return;
        const container = refs.get('container');
        if (!container || isContainer(e.target, container)) return;
        _.defer(() => hide());
    };

    const hide = () => setState({ visible: false });
    const show = () => setState({ visible: true });
    const toggle = () => setState({ visible: !state.visible });

    const _search = value => {
        refs.get('picker').setSearch(value);
        dispatch('search', { search: value });
    };

    const search = _.throttle(_search, 100);

    const dispatch = (eventType, data = {}) => {
        const evt = new ComponentEvent(eventType, data);
        handle.dispatchEvent(evt);

        const etype = camelcase(`on-${eventType}`);
        const handler = op.get(props, etype);
        if (typeof handler === 'function') handler(evt);

        if (eventType === 'change' && state.form && name) {
            const formChange = new Event('change');
            state.form.dispatchEvent(formChange);
        }
    };

    const _onChange = e => {
        const { value } = e.target;
        const [icon] = _.flatten([value]);
        if (icon && icon !== state.value && op.has(Icon, icon)) {
            if (name && refs.get('input')) refs.get('input').value = value;
            setState({ value: icon });
        }

        hide();
    };

    const _handle = () => ({
        ...props,
        container: refs.get('container'),
        dataset: state.dataset,
        dispatch,
        hide,
        search,
        setState,
        setValue: value => setState({ value }),
        show,
        state,
        toggle,
        value: state.value,
        visible: state.visible,
        Form: state.form,
        Picker: refs.get('picker'),
    });

    const [handle, setHandle] = useEventHandle(_handle());

    const refresh = () => {
        const newHandle = _handle();
        Object.entries(newHandle).forEach(([key, val]) => {
            handle[key] = val;
        });
        setHandle(handle);
    };

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.addEventListener('mousedown', autoHide);
        window.addEventListener('touchstart', autoHide);

        return () => {
            window.removeEventListener('mousedown', autoHide);
            window.removeEventListener('touchstart', autoHide);
        };
    });

    useEffect(() => {
        setStatus('ready');
        setState({ value: initialValue });
    }, [initialValue]);

    useEffect(() => {
        setState({ visible: props.visible });
    }, [props.visible]);

    useEffect(refresh, [
        state.value,
        state.visible,
        state.dataset,
        refs.get('picker'),
        refs.get('container'),
    ]);

    useEffect(() => {
        const type = state.visible ? 'show' : 'hide';
        dispatch(type, { visible: state.visible });
    }, [state.visible]);

    useEffect(() => {
        if (!isStatus('ready')) return;
        dispatch('change', { value: state.value });
    }, [state.value]);

    useEffect(() => {
        const container = refs.get('container');
        if (!name || !container || state.form) return;
        const form = ancestor(container, 'form');
        setState({ form });
    });

    useEffect(() => {
        const dataset = Object.keys(props)
            .filter(k => String(k).startsWith('data-'))
            .reduce((obj, k) => {
                const key = k.split('data-').pop();
                obj[key] = op.get(props, k);
                return obj;
            }, {});

        setState({ dataset });
    }, [props.dataset]);

    op.set(style, 'display', state.visible ? null : 'none');

    return (
        <div
            style={style}
            className={className}
            ref={elm => refs.set('container', elm)}>
            {name && (
                <input
                    type='hidden'
                    name={name}
                    defaultValue={state.value}
                    ref={elm => refs.set('input', elm)}
                />
            )}
            <div className='rte-icons-search'>
                <div className='form-group'>
                    <input
                        type='search'
                        placeholder='search'
                        onFocus={e => e.target.select()}
                        onChange={e => search(e.target.value)}
                    />
                </div>
            </div>
            <Picker onChange={_onChange} ref={elm => refs.set('picker', elm)} />
        </div>
    );
};

IconSelect = forwardRef(IconSelect);

IconSelect.propTypes = {
    className: PropTypes.string,
    name: PropTypes.string,
    style: PropTypes.object,
    value: PropTypes.string,
    visible: PropTypes.bool,
};

export { IconSelect, IconSelect as default };
