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
    useSelect,
    useStatus,
} from 'reactium-core/sdk';

const noop = () => {};

const STATUS = {
    COMPLETE: 'complete',
    PENDING: 'pending',
    READY: 'ready',
    UPDATED: 'updated',
};

let ImageInput = (
    {
        dropzoneProps,
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

    const { Button, Dropzone, Icon, Progress } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus(STATUS.PENDING);

    const [state, update] = useDerivedState({
        chunk,
        directory: 'uploads',
        maxHeight,
        minHeight,
        page,
        pages: 1,
        progress: 0,
        upload: null,
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
            Array.from(media).filter(file => op.get(file, 'type') === 'IMAGE'),
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

        Reactium.Hook.runSync('rte-image-input', items);

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

    const _onFileAdded = e => {
        if (state.upload) return;
        const upload = _.first(e.added);
        Reactium.Media.upload([upload], state.directory);
        setState({ value: null, upload: { ...upload, progress: 0 } });
    };

    const _onFileComplete = e => {
        if (!isStatus(STATUS.COMPLETE)) {
            setStatus(STATUS.COMPLETE);
            return;
        }

        if (!state.upload) return;

        const { ID, url } = e.params;
        if (state.upload.ID !== ID) return;

        setState({ upload: null }, true);
        setValue(url);
    };

    const _onFileProgress = e => {
        if (e.type !== 'status' || unMounted()) return;
        if (!state.upload) return;

        let { upload } = state;
        const { ID, progress } = e.params;

        if (upload.ID !== ID || progress === 1) return;

        op.set(upload, 'progress', progress);

        setState({ upload });
    };

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
        scrollToTop();
        setValue(v);
        hide();
    };

    const _pages = () => {
        const images = _data(-1).length;
        return Math.ceil(images / state.chunk);
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
            case STATUS.COMPLETE:
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
        const hooks = [
            Reactium.Hook.registerSync('media-worker', _onFileProgress),
            Reactium.Hook.registerSync('media-complete', _onFileComplete),
        ];
        return () => {
            hooks.forEach(hook => Reactium.Hook.unregister(hook));
        };
    }, []);

    useEffect(() => {
        Reactium.Media.fetch({ page: -1 });
    }, []);

    return (
        <Dropzone
            {...dropzoneProps}
            onFileAdded={_onFileAdded}
            ref={elm => refs.set('dropzone', elm)}>
            <div data-file />
            <div
                className={cn(namespace)}
                ref={elm => refs.set('container', elm)}>
                <div className='fieldset'>
                    <input
                        {...props}
                        type='text'
                        onFocus={_onFocus}
                        onKeyUp={_onKeyUp}
                        onChange={_onChange}
                        disabled={!!state.upload}
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
                                <>
                                    <div className='active transparent ar-image-select-thumb'>
                                        <img src={state.value} />
                                    </div>
                                    <Button
                                        className='delete'
                                        size={Button.ENUMS.SIZE.XS}
                                        onClick={() => setValue(null)}
                                        color={Button.ENUMS.COLOR.DANGER}>
                                        <Icon name='Feather.X' />
                                    </Button>
                                </>
                            )}
                            {!state.value && !state.upload && (
                                <div className='uploader'>
                                    {__('Drag & Drop')}
                                    <div>{__('or')}</div>
                                    <Button
                                        outline
                                        data-file
                                        appearance={
                                            Button.ENUMS.APPEARANCE.PILL
                                        }>
                                        {__('Upload')}
                                    </Button>
                                </div>
                            )}
                            {state.upload && (
                                <div className='uploads'>
                                    <img src={state.upload.dataURL} />
                                    <div className='progress'>
                                        <Progress
                                            value={state.upload.progress}
                                            size={Progress.ENUMS.SIZE.XS}
                                            appearance={
                                                Progress.ENUMS.APPEARANCE.PILL
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                            {_data(state.page).map((url, i) => (
                                <button
                                    key={btoa([url, i])}
                                    onClick={_onSelect(url)}
                                    className='transparent ar-image-select-thumb'>
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
        </Dropzone>
    );
};

ImageInput = forwardRef(ImageInput);

ImageInput.defaultProps = {
    chunk: 10,
    dropzoneProps: {
        config: {
            chunking: false,
            maxFiles: 1,
            clickable: '[data-file]',
            previewTemplate: '<span />',
        },
        debug: false,
    },
    minHeight: 125,
    namespace: 'input-button',
    page: 1,
    value: null,
    visible: false,
};

export { ImageInput, ImageInput as default };
