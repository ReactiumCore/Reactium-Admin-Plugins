import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ENUMS from '../enums';
import slugify from 'slugify';
import Sidebar from './Sidebar';
import useDirectories from '../Directory/useDirectories';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useRegisterHandle,
    Zone,
} from 'reactium-core/sdk';

import {
    Alert,
    Dropzone,
    EventForm,
    Icon,
    Spinner,
    Toast,
} from '@atomic-reactor/reactium-ui';

const noop = () => {};

ENUMS.DEBUG = false;

const debug = (...args) => {
    if (ENUMS.DEBUG === true) console.log(...args);
};

const alertDefault = {
    color: Alert.ENUMS.COLOR.INFO,
    icon: 'Feather.Flag',
};

export class MediaEvent extends CustomEvent {
    constructor(type, data) {
        super(type, data);

        op.del(data, 'type');
        op.del(data, 'target');

        Object.entries(data).forEach(([key, value]) => {
            if (!this[key]) {
                try {
                    this[key] = value;
                } catch (err) {}
            } else {
                key = `__${key}`;
                this[key] = value;
            }
        });
    }
}

const Editor = ({
    className,
    dropzoneProps,
    namespace,
    onError,
    onFail,
    onLoad,
    onStatus,
    onSubmit,
    onSuccess,
    onValidate,
    params,
    ...props
}) => {
    // Hooks and External Components
    const Helmet = useHookComponent('Helmet');

    const directories = useDirectories();

    // Refs
    const alertRef = useRef();
    const dropzoneRef = useRef();
    const formRef = useRef();
    const persist = useRef({});

    // States
    const defaultState = {
        ...params,
        clean: true,
        dirty: false,
        initialized: false,
        status: ENUMS.STATUS.INIT,
        title: op.get(props, 'title'),
        value: {},
    };

    const [alert, setNewAlert] = useState(alertDefault);

    const [errors, setNewErrors] = useState();

    const [, setUpdated] = useState();

    const [prevState, setPrevState] = useDerivedState({
        ...defaultState,
        id: null,
    });

    const [state, update] = useDerivedState({
        ...defaultState,
        errors: {},
        value: {},
        type: undefined,
    });

    // Set operations
    const forceUpdate = () => {
        if (unMounted()) return;
        setUpdated(Date.now());
    };

    const setAlert = newAlert => {
        if (unMounted()) return;
        setNewAlert(newAlert);
        forceUpdate(Date.now());
    };

    const setErrors = newErrors => {
        if (unMounted()) return;
        setNewErrors(newErrors);
    };

    const setState = newState => {
        if (unMounted()) return;
        setPrevState(Object.assign(state));
        update(newState);
    };

    // Functions
    const browse = () => dropzoneRef.current.browseFiles();

    const cancel = () => {
        const { filename } = persist.current;
        const value = { ...state.value, filename };
        setState({ upload: null, value });
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = cn(cx(), className);

    const dispatch = async (eventType, event, callback) => {
        if (unMounted()) return;

        eventType = String(eventType).toUpperCase();

        // passive dirty events
        const dirtyEvents = _.pluck(Reactium.Media.DirtyEvent.list, 'id');
        if (dirtyEvents.includes(String(eventType).toLowerCase())) {
            if (!_.isEqual(persist.current, state.value)) {
                setState({ dirty: event, clean: false });

                // NOTE: DONOT await these dispatch calls so that they happen after the current process
                dispatch('status', { event: 'dirty', ...event });
                dispatch('dirty', event);
            } else {
                setState({ clean: event, dirty: false });
                await dispatch('status', { event: 'clean', ...event });
                await dispatch('clean', event);
                return;
            }
        }

        if (op.has(event, 'event')) {
            op.set(event, 'event', String(event.event).toUpperCase());
            if (eventType === 'STATUS') {
                setState({ status: event.event });
            }
        }

        const evt = new MediaEvent(eventType, event);
        handle.dispatchEvent(evt);

        debug(eventType, evt);

        await Reactium.Hook.run(`form-user-${eventType}`, evt, handle);
        if (unMounted()) return;

        if (eventType === 'STATUS') callback = onStatus;
        if (typeof callback === 'function') await callback(evt);
        if (unMounted()) return;

        // passive clean events
        const scrubEvents = _.pluck(Reactium.Media.ScrubEvent.list, 'id');
        if (scrubEvents.includes(String(eventType).toLowerCase())) {
            setState({ clean: event, dirty: false });
            await dispatch('status', { event: 'clean', ...event });
            await dispatch('clean', event);
        }
    };

    const getData = async objectId => {
        if (unMounted()) return;
        setState({ status: ENUMS.STATUS.LOADING, initialized: false });

        if (formRef.current) formRef.current.setValue(null);

        await dispatch('status', { event: ENUMS.STATUS.LOADING, objectId });
        await dispatch(ENUMS.STATUS.LOADING, { objectId });

        let value = Reactium.Media.selected
            ? Reactium.Media.selected
            : await Reactium.Media.retrieve(objectId);

        persist.current = Object.assign(value);

        Reactium.Media.selected = null;

        if (unMounted()) return;

        setState({
            value,
            status: ENUMS.STATUS.LOADED,
            type: String(op.get(value, 'type')).toLowerCase(),
        });

        await dispatch('status', {
            event: ENUMS.STATUS.LOADED,
            objectId,
            value,
        });

        await dispatch(ENUMS.STATUS.LOADED, { objectId, value }, onLoad);

        _.defer(async () => {
            setState({ status: ENUMS.STATUS.READY, initialized: true });
            await dispatch('status', { event: ENUMS.STATUS.READY });
            await dispatch('ready', { value });
        });
    };

    const _initialize = () => {
        if (state.status === ENUMS.STATUS.INIT) {
            getData(state.id);
        }

        return () => {};
    };

    const initialize = _.once(_initialize);

    const isBusy = () => {
        const statuses = [
            ENUMS.STATUS.INIT,
            ENUMS.STATUS.LOADING,
            ENUMS.STATUS.SAVING,
            ENUMS.STATUS.VALIDATING,
            ENUMS.STATUS.VALIDATED,
        ];

        return statuses.includes(String(state.status).toUpperCase());
    };

    const isClean = () => !isDirty();

    const isDirty = () => state.dirty !== false;

    const isMounted = () => !unMounted();

    const parseErrorMessage = (str, replacers = {}) => {
        Object.entries(replacers).forEach(([key, value]) => {
            str = str.split(key).join(value);
        });

        return str;
    };

    const save = async value => {
        const upload = op.get(state, 'upload');
        if (upload) {
            op.set(value, 'file', upload);
        } else {
            op.del(value, 'file');
        }

        // Clean up value object:
        [
            'capabilities',
            'createdAt',
            'fetched',
            'type',
            'uuid',
            'updateAt',
            'upload',
            'user',
        ].forEach(param => op.del(value, param));

        setAlert(alertDefault);
        setErrors(undefined);

        await dispatch('status', { event: ENUMS.STATUS.VALIDATED, value });
        await dispatch(ENUMS.STATUS.VALIDATED, { value });

        await dispatch('status', { event: ENUMS.STATUS.SAVING, value });
        await dispatch(ENUMS.STATUS.SAVING, { value }, onSubmit);

        await Reactium.Hook.run('media-submit', value);

        return Reactium.Media.update(value)
            .then(async response => {
                if (_.isError(response)) {
                    return Promise.reject(response);
                } else {
                    return _onSuccess({ media: response });
                }
            })
            .catch(error => _onFail({ error, value }));
    };

    const saveHotkey = e => {
        if (e) e.preventDefault();
        submit();
    };

    const submit = () => {
        if (unMounted() || isBusy()) return;
        formRef.current.submit();
    };

    const unMounted = () => {
        if (!formRef.current) return true;
        if (!formRef.current.form) return true;

        return false;
    };

    const _onError = async context => {
        const { error } = context;
        const errors = Object.values(error);

        const alertObj = {
            message: <ErrorMessages errors={errors} editor={handle} />,
            icon: 'Feather.AlertOctagon',
            color: Alert.ENUMS.COLOR.DANGER,
        };

        if (isMounted()) {
            setErrors(errors);
            setAlert(alertObj);
        }

        _.defer(async () => {
            await dispatch('status', { event: ENUMS.STATUS.ERROR, error });
            await dispatch(ENUMS.STATUS.ERROR, { error }, onError);
        });

        return context;
    };

    const _onFail = async e => {
        const { error, value } = e;
        if (error) {
            const alertObj = {
                color: Alert.ENUMS.COLOR.DANGER,
                message: (
                    <ul className={cx('errors')}>
                        <li>{op.get(error, 'message')}</li>
                    </ul>
                ),
                icon: 'Feather.AlertOctagon',
            };

            setAlert(alertObj);
        }

        await dispatch('status', {
            event: ENUMS.STATUS.FAILED,
            error,
            value,
        });
        await dispatch(ENUMS.STATUS.FAILED, { error, value }, onFail);

        let message = __('Unable to save %filename');
        message = String(message).replace(
            /\%filename/gi,
            op.get(value, 'filename', 'file'),
        );

        Toast.show({
            icon: 'Feather.AlertOctagon',
            message,
            type: Toast.TYPE.ERROR,
        });

        return Promise.resolve(e);
    };

    const _onFileAdded = async e => {
        // Already processing an upload?
        if (state.status === ENUMS.STATUS.PROCESSING) {
            Toast.show({
                type: Toast.TYPE.ERROR,
                icon: 'Feather.AlertOctagon',
                message: 'Upload in progress',
            });

            return;
        }

        const value = { ...state.value };

        // Get the added file
        const file = e.added[0];

        await dispatch('status', { event: 'before-file-added', file, value });
        await dispatch('before-file-added', { file, value });

        // Check file size
        if (file.size > ENUMS.MAX_SIZE) {
            const error = {
                color: Alert.ENUMS.COLOR.DANGER,
                icon: 'Feather.AlertOctagon',
                message: `File exceeds the max file size of ${ENUMS.MAX_SIZE /
                    1048576}mb`,
            };

            setAlert(error);

            await dispatch('status', {
                error,
                detail: e,
                value,
                event: 'file-error',
            });
            await dispatch('file-error', { error, detail: e, value });

            return;
        }

        // Check file type
        const { type } = value;
        const ext = String(
            String(file.name)
                .split('.')
                .pop(),
        ).toUpperCase();

        if (!ENUMS.TYPE[type].includes(ext)) {
            const error = {
                color: Alert.ENUMS.COLOR.DANGER,
                icon: 'Feather.AlertOctagon',
                message: `Invalid ${type} file type ${ext}`,
            };

            setAlert(error);

            await dispatch('status', {
                error,
                detail: e,
                value,
                event: 'file-error',
            });
            await dispatch('file-error', { error, detail: e, value });

            return;
        }

        // Read file
        const reader = new FileReader();
        reader.onload = async () => {
            op.set(value, 'filename', String(slugify(file.name)).toLowerCase());
            op.set(value, 'meta.size', file.size);
            op.set(value, 'ext', ext);

            await dispatch('status', { event: 'file-added', file, value });
            await dispatch('file-added', { file, value });

            dropzoneRef.current.dropzone.removeAllFiles();

            setState({
                upload: file,
                value,
            });
        };

        reader.readAsText(file.slice(0, 4));
    };

    const _onFileError = e => {
        let { message } = e;
        message = String(message)
            .toLowerCase()
            .includes('file is too big')
            ? `File exceeds the max file size of ${ENUMS.MAX_SIZE / 1048576}mb`
            : message;

        const error = {
            color: Alert.ENUMS.COLOR.DANGER,
            icon: 'Feather.AlertOctagon',
            message,
        };

        setAlert(error);

        dispatch('status', { detail: e, event: 'file-error', error });
        dispatch('file-error', { error, event: e });
    };

    const _onFormChange = e => {
        if (state.status === ENUMS.STATUS.LOADED) return;

        const { value: currentValue } = state;
        const { value: formValue } = e;

        if (_.isEqual(currentValue, formValue)) return;
        const value = { ...currentValue, ...formValue };
        setState({ value });
    };

    const _onFormSubmit = e => {
        const value = Object.assign(e.value);
        return save(value);
    };

    const _onSuccess = async value => {
        let message = __('Saved %filename!');
        message = message.replace(/\%filename/gi, value.filename);

        persist.current = value;

        Toast.show({
            icon: 'Feather.Check',
            message,
            type: Toast.TYPE.INFO,
        });

        await dispatch('status', {
            event: ENUMS.STATUS.SAVED,
            value,
        });

        await dispatch(ENUMS.STATUS.SAVED, { value }, onSuccess);

        setState({ value, upload: undefined });

        return Promise.resolve(value);
    };

    const _onValidate = async e => {
        const { value, ...context } = e;

        await dispatch('status', {
            event: ENUMS.STATUS.VALIDATING,
            context,
            value,
        });
        await dispatch(ENUMS.STATUS.VALIDATING, { context, value }, onValidate);

        await Reactium.Hook.run('media-validate', { context, value });

        if (context.valid !== true) _onError(context);

        return { ...context, value };
    };

    const _onWorkerMessage = async (...args) => {
        const props = args[0];

        const { type, ...e } = props;
        if (type !== 'status') return;

        const { params } = e;
        const progress = op.get(params, 'progress');
        const result = op.get(params, 'result');
        const status = op.get(params, 'status');

        await dispatch('status', { event: status, progress });
        await dispatch(status, { progress });

        if (status === ENUMS.STATUS.COMPLETE) {
            await _onSuccess(result);
        }
    };

    const _handle = () => ({
        ...params,
        refs: {
            alertRef,
            dropzoneRef,
            formRef,
            persist,
        },
        alert,
        browse,
        cancel,
        cx,
        directories,
        dispatch,
        errors,
        forceUpdate,
        isBusy,
        isClean,
        isDirty,
        isMounted,
        parseErrorMessage,
        save,
        setAlert,
        setErrors,
        setState,
        state,
        submit,
        unMounted,
    });

    const [handle, updateHandle] = useEventHandle(_handle());

    // Initialize
    useEffect(initialize, [state.id]);

    // Save hotkey
    useEffect(() => {
        Reactium.Hotkeys.register('media-save', {
            callback: saveHotkey,
            key: 'mod+s',
            order: Reactium.Enums.priority.lowest,
            scope: document,
        });

        return () => {
            Reactium.Hotkeys.unregister('media-save');
        };
    });

    // State change
    useAsyncEffect(
        async mounted => {
            if (state.initialized !== true) return;

            const changed = {};
            let watch = ['value', 'id', 'objectId', 'upload'];

            await Reactium.Hook.run('media-watch-fields', watch);
            watch = _.uniq(watch);
            watch.sort();

            const cstate = op.get(state);
            const pstate = op.get(prevState);

            watch.forEach(field => {
                const current = op.get(cstate, field);
                const previous = op.get(pstate, field);

                if (!_.isEqual(current, previous)) {
                    op.set(changed, field, { current, previous });
                }
            });

            if (Object.keys(changed).length > 0) {
                if (op.has(changed, 'id')) {
                    getData(changed.id.current);
                } else {
                    if (!mounted()) return;
                    await dispatch('status', { event: 'change', changed });
                    await dispatch('change', { changed });
                }
            }
        },
        [Object.values(state)],
    );

    // Update on params change
    useEffect(() => {
        if (params.id !== handle.id) {
            setState({
                id: params.id,
                initialized: false,
                status: ENUMS.STATUS.INIT,
            });
            _.defer(() => {
                if (unMounted()) return;
                _initialize();
            });
        }
    }, [params.id]);

    // Update handle
    useEffect(() => {
        updateHandle(_handle());
    }, [Object.values(state), Object.values(params), alert, errors]);

    // Regsiter media-worker hook
    useEffect(() => {
        const workerHook = Reactium.Hook.register(
            'media-worker',
            _onWorkerMessage,
        );

        return () => {
            Reactium.Hook.unregister(workerHook);
        };
    }, []);

    // Register handle
    // useImperativeHandle(ref, () => handle, [handle]);
    useRegisterHandle('MediaEditor', () => handle, [handle]);

    const render = useCallback(() => {
        let { type } = state;
        type = type ? String(type).toLowerCase() : type;

        const title = op.get(state, 'title');
        const metaZoneName = type ? cx('meta-' + type) : null;

        return (
            <Dropzone
                {...dropzoneProps}
                className={cx('dropzone')}
                onError={e => _onFileError(e)}
                onFileAdded={e => _onFileAdded(e)}
                ref={dropzoneRef}>
                <EventForm
                    className={cname}
                    onChange={_onFormChange}
                    onSubmit={_onFormSubmit}
                    ref={formRef}
                    validator={_onValidate}
                    value={state.value}>
                    <Helmet>
                        <title>{title}</title>
                    </Helmet>
                    {op.get(alert, 'message') && (
                        <div className={cx('alert')}>
                            <Alert
                                dismissable
                                ref={alertRef}
                                onHide={() => setAlert(alertDefault)}
                                color={op.get(alert, 'color')}
                                icon={
                                    <Icon
                                        name={op.get(
                                            alert,
                                            'icon',
                                            'Feather.AlertOctagon',
                                        )}
                                    />
                                }>
                                {op.get(alert, 'message')}
                            </Alert>
                        </div>
                    )}
                    <div className={cn(cx('main'), { visible: !!type })}>
                        {type && <Zone zone={cx(type)} editor={handle} />}
                    </div>
                    {!type && <Spinner />}
                    <Sidebar editor={handle}>
                        <div className={cx('meta')}>
                            <Zone zone={cx('meta')} editor={handle} />
                            {type && (
                                <Zone zone={metaZoneName} editor={handle} />
                            )}
                            <div className={cx('meta-spacer')} />
                            <div className={cx('sidebar-footer')}>
                                <Zone
                                    zone={cx('sidebar-footer')}
                                    editor={handle}
                                />
                            </div>
                        </div>
                    </Sidebar>
                </EventForm>
            </Dropzone>
        );
    });

    return render();
};

const ErrorMessages = ({ editor, errors }) => {
    const canFocus = element => typeof element.focus === 'function';

    const jumpTo = (e, element) => {
        e.preventDefault();
        element.focus();
    };

    return (
        <ul className={editor.cx('errors')}>
            {errors.map(({ message, field, focus, value = '' }, i) => {
                const replacers = {
                    '%fieldName': field,
                    '%value': value,
                };
                message = editor.parseErrorMessage(message, replacers);
                message = !canFocus(focus) ? (
                    message
                ) : (
                    <a href='#' onClick={e => jumpTo(e, focus)}>
                        {message}
                        <Icon
                            name='Feather.CornerRightDown'
                            size={12}
                            className='ml-xs-8'
                        />
                    </a>
                );
                return <li key={`error-${i}`}>{message}</li>;
            })}
        </ul>
    );
};

Editor.defaultProps = {
    dropzoneProps: {
        config: {
            chunking: false,
            clickable: true,
            maxFiles: 1,
            maxFilesize: ENUMS.MAX_SIZE / 1048576,
            previewTemplate: '<span />',
        },
        debug: false,
    },
    namespace: 'admin-media-editor',
    onChange: noop,
    onError: noop,
    onFail: noop,
    onLoad: noop,
    onReady: noop,
    onStatus: noop,
    onSubmit: noop,
    onSuccess: noop,
    onValidate: noop,
    title: __('Media Editor'),
};

export { Editor, Editor as default };
