import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Scrollbars } from 'react-custom-scrollbars';

import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import Reactium, {
    __,
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useIsContainer,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const noop = () => {};

const STATUS = {
    PENDING: 'pending',
    READY: 'ready',
    UPDATED: 'updated',
};

let ImageInput = (
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

    const redux = Reactium.Redux.store;

    const isContainer = useIsContainer();

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus(STATUS.PENDING);

    const [state, update] = useDerivedState({
        chunk: 20,
        page: 1,
        pages: 1,
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

    const _onImageLoad = e => {
        if (!e.target) return;
        e.target.classList.remove('loading');
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

    const _value = () => state.value || '';

    const _pages = () => {
        const images = _data(-1).length;
        return Math.ceil(images / state.chunk);
    };

    const _data = (pg = 1) => {
        let { library = [] } = redux.getState().Media;
        library = _.chain(
            library.filter(file => op.get(file, 'type') === 'IMAGE'),
        )
            .pluck('url')
            .sortBy('updatedAt')
            .value();

        library.reverse();

        let images = JSON.parse(JSON.stringify(library));
        images = _.chain(images)
            .compact()
            .uniq()
            .without(state.value)
            .value();

        Reactium.Hook.runSync('rte-image-picker', images);

        return pg >= 1 ? images.slice(0, pg * state.chunk) : images;
    };

    const unMounted = () => !refs.get('container');

    const _handle = () => ({
        blur: hide,
        dispatch,
        focus: show,
        hide,
        images: _data,
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
            if (!isStatus(STATUS.PENDING)) {
                onChange(dispatch('change', { value: handle.value }));
            }

            const input = refs.get('input');
            if (input && input.value !== handle.value) {
                input.value = handle.value;
            }

            setHandle(handle);
        }
    }, [status, state.value]);

    useEffect(() => {
        dispatch('status', { status, isStatus, setStatus });

        switch (status) {
            case STATUS.UPDATED:
                setStatus('ready', true);
                break;
        }
    }, [status]);

    useEffect(() => {
        setStatus(STATUS.UPDATED);
        setState('pages', _pages());
    }, [redux.getState().Media.library]);

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
                <Button
                    readOnly
                    color='tertiary'
                    style={{ pointerEvents: 'none' }}>
                    <Icon name='Feather.ChevronDown' size={20} />
                </Button>
            </div>
            <div
                className='ar-image-select'
                style={{ display: !state.visible ? 'none' : null }}>
                <Scrollbars
                    autoHeight
                    autoHeightMax={maxHeight}
                    autoHeightMin={minHeight}>
                    <div className='ar-image-select-thumbs'>
                        {state.value && (
                            <button
                                className={cn(
                                    'ar-image-select-thumb',
                                    'transparent',
                                    {
                                        active: state.value === state.value,
                                    },
                                )}
                                onClick={_onSelect(state.value)}>
                                <img src={state.value} />
                            </button>
                        )}
                        {_data(state.page).map((url, i) => (
                            <button
                                className={cn(
                                    'ar-image-select-thumb',
                                    'transparent',
                                    {
                                        active: state.value === url,
                                    },
                                )}
                                key={btoa([url, i])}
                                onClick={_onSelect(url)}>
                                <img
                                    src={url}
                                    className='loading'
                                    onLoad={_onImageLoad}
                                />
                            </button>
                        ))}
                        {state.page < state.pages && (
                            <div className='more'>
                                <Button
                                    block
                                    color={Button.ENUMS.TERTIARY}
                                    onClick={() =>
                                        setState('page', state.page + 1)
                                    }>
                                    {__('Load More')}
                                </Button>
                            </div>
                        )}
                    </div>
                </Scrollbars>
            </div>
        </div>
    );
};

ImageInput = forwardRef(ImageInput);

ImageInput.defaultProps = {
    maxHeight: 400,
    minHeight: 48,
    namespace: 'input-button',
    value: null,
    visible: false,
};

export { ImageInput, ImageInput as default };
