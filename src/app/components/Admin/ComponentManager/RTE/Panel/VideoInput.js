import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ReactPlayer from 'react-player';
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
    useSelect,
    useStatus,
} from 'reactium-core/sdk';

const noop = () => {};

const STATUS = {
    PENDING: 'pending',
    READY: 'ready',
    UPDATED: 'updated',
};

let VideoInput = (
    {
        chunk,
        maxHeight,
        minHeight,
        namespace,
        page,
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

    const media = useSelect(state => op.get(state, 'Media.library', []));

    const isContainer = useIsContainer();

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus(STATUS.PENDING);

    const [state, update] = useDerivedState({
        chunk,
        maxHeight,
        minHeight,
        page,
        pages: 1,
        value: props.defaultValue || initialValue,
        visible: initialVisible,
    });

    const setState = (k, v, silent) => {
        if (unMounted()) return;
        const newState = _.isString(k) ? { [k]: v } : k;
        silent = !_.isString(k) ? v : silent;
        update(newState, silent);
    };

    const setValue = v => setState('value', v);

    const setVisible = v => setState('visible', v);

    const dispatch = (e, eventObj) => {
        const evt = new ComponentEvent(e, eventObj);
        handle.dispatchEvent(evt);
        return evt;
    };

    const hide = () => setVisible(false);

    const scrollToTop = (val = 0) => {
        let scroll = refs.get('scroll');
        if (!scroll) return;
        let cont = scroll.container.firstChild;
        cont.scrollTop = val;
    };

    const show = () => setVisible(true);

    const toggle = () => setVisible(!state.visible);

    const _data = (pg = 1) => {
        let items = _.chain(
            Array.from(media).filter(file => op.get(file, 'type') === 'VIDEO'),
        )
            .pluck('url')
            .sortBy('updatedAt')
            .value();

        items.reverse();
        items = _.chain(items)
            .compact()
            .uniq()
            .without(state.value)
            .value();

        Reactium.Hook.runSync('rte-video-input', items);

        return pg >= 1 ? items.slice(0, pg * state.chunk) : items;
    };

    const _maxHeight = () => {
        if (!window) {
            return state.maxHeight || 300;
        } else {
            return state.maxHeight || window.innerHeight * 0.8 - 125;
        }
    };

    const _next = () => setState('page', state.page + 1);

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
        scrollToTop();
        setValue(v);
        hide();
    };

    const _pages = () => {
        const items = _data(-1).length;
        return Math.ceil(items / state.chunk);
    };

    const _value = () => state.value || '';

    const unMounted = () => !refs.get('container');

    const _handle = () => ({
        ...props,
        blur: hide,
        dispatch,
        focus: show,
        hide,
        isStatus,
        refs,
        scrollToTop,
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

        const input = refs.get('input');
        if (input && input.value !== newValue) {
            input.value = newValue;
        }

        if (handle.value !== newValue) {
            handle.value = newValue;
            if (!isStatus(STATUS.PENDING)) {
                onChange(dispatch('change', { value: handle.value }));
            }

            setHandle(handle);
        }
    });

    useEffect(() => {
        dispatch('status', { status, isStatus, setStatus });

        switch (status) {
            case STATUS.UPDATED:
                setStatus(STATUS.READY, true);
                break;
        }
    }, [status]);

    useEffect(() => {
        setStatus(STATUS.UPDATED);
        setState('pages', _pages());
    }, [media]);

    useEffect(() => {
        if (!window) return;
        window.addEventListener('mousedown', _onBlur);
        window.addEventListener('touchstart', _onBlur);

        return () => {
            window.removeEventListener('mousedown', _onBlur);
            window.removeEventListener('touchstart', _onBlur);
        };
    }, []);

    useEffect(() => {
        Reactium.Media.fetch({ page: -1 });
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
                    autoHeightMax={_maxHeight()}
                    autoHeightMin={state.minHeight}
                    ref={elm => refs.set('scroll', elm)}>
                    <div className='ar-image-select-thumbs'>
                        {state.value && !state.uploads && (
                            <div className='ar-image-select-video active'>
                                <ReactPlayer
                                    controls
                                    width='100%'
                                    height='auto'
                                    url={state.value}
                                />
                                <Button
                                    className='delete'
                                    size={Button.ENUMS.SIZE.XS}
                                    onClick={() => setValue(null)}
                                    color={Button.ENUMS.COLOR.DANGER}>
                                    <Icon name='Feather.X' />
                                </Button>
                            </div>
                        )}
                        {_data(state.page).map((url, i) => (
                            <div
                                className='ar-image-select-video'
                                key={btoa([url, i])}>
                                <ReactPlayer
                                    controls
                                    url={url}
                                    width='100%'
                                    height='auto'
                                />
                                <Button
                                    className='hover'
                                    onClick={_onSelect(url)}
                                    size={Button.ENUMS.SIZE.XS}
                                    color={Button.ENUMS.COLOR.SECONDARY}>
                                    <span className='mouseover'>
                                        <Icon name='Feather.CheckSquare' />
                                    </span>
                                    <span className='mouseout'>
                                        <Icon name='Feather.Square' />
                                    </span>
                                </Button>
                            </div>
                        ))}
                        {state.page < state.pages && (
                            <div className='more'>
                                <Button
                                    block
                                    onClick={_next}
                                    color={Button.ENUMS.COLOR.TERTIARY}>
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

VideoInput = forwardRef(VideoInput);

VideoInput.defaultProps = {
    chunk: 10,
    minHeight: 125,
    namespace: 'input-button',
    page: 1,
    value: null,
    visible: false,
};

export { VideoInput, VideoInput as default };
