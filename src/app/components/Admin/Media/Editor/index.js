import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Sidebar from './Sidebar';
import ENUMS from 'components/Admin/Media/enums';

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHandle,
    useHookComponent,
    useRegisterHandle,
    Zone,
} from 'reactium-core/sdk';

import { Alert, Icon, EventForm, Spinner } from '@atomic-reactor/reactium-ui';

const noop = () => {};

ENUMS.DEBUG = false;

const debug = (...args) => {
    if (ENUMS.DEBUG === true) console.log(...args);
};

export const useDirectories = (params = {}) => {
    const [state, setNewState] = useState({
        data: undefined,
        status: ENUMS.STATUS.INIT,
    });

    const setState = newState =>
        setNewState({
            ...state,
            ...newState,
        });

    useEffect(() => {
        const { status } = state;

        if (status === ENUMS.STATUS.INIT && !op.get(state, 'data')) {
            setState({ status: ENUMS.STATUS.FETCHING });
            Reactium.Cloud.run('directories', params).then(results =>
                setState({ status: ENUMS.STATUS.READY, data: results }),
            );
        }
    });

    return state.data;
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

let Editor = (
    {
        className,
        namespace,
        onChange,
        onError,
        onFail,
        onLoad,
        onReady,
        onStatus,
        onSubmit,
        onSuccess,
        onValidate,
        params,
        ...props
    },
    ref,
) => {
    const Helmet = useHookComponent('Helmet');

    const tools = useHandle('AdminTools');

    const Toast = op.get(tools, 'Toast');

    const directories = useDirectories();

    const alertRef = useRef();
    const formRef = useRef();

    const defaultState = {
        ...params,
        clean: true,
        dirty: false,
        initialized: false,
        status: ENUMS.STATUS.INIT,
        title: op.get(props, 'title'),
        value: {},
    };

    const [alert, setNewAlert] = useState();

    const [errors, setErrors] = useState();

    const [updated, setUpdated] = useState();

    const [prevState, setPrevState] = useDerivedState({
        ...defaultState,
        id: null,
    });

    const [state, update] = useDerivedState({
        ...defaultState,
        errors: {},
        value: {},
    });

    const forceUpdate = () => {
        if (unMounted()) return;
        setUpdated(Date.now());
    };

    const setAlert = newAlert => {
        if (unMounted()) return;
        setNewAlert(newAlert);
        forceUpdate(Date.now());
    };

    const setState = newState => {
        if (unMounted()) return;
        setPrevState(JSON.parse(JSON.stringify(state)));
        update(newState);
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = cn(cx(), className);

    const dispatch = async (eventType, event, callback) => {
        if (unMounted()) return;

        eventType = String(eventType).toUpperCase();

        // passive dirty events
        const dirtyEvents = _.pluck(Reactium.Media.DirtyEvent.list, 'id');
        if (dirtyEvents.includes(String(eventType).toLowerCase())) {
            setState({ dirty: event, clean: false });

            // NOTE: DONOT await these dispatch calls so that they happen after the current process
            dispatch('dirty', event);
            dispatch('status', { event: 'dirty', ...event });
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
            await dispatch('clean', event);
            await dispatch('status', { event: 'clean', ...event });
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

        // Reactium.Media.selected = null;

        if (unMounted()) return;

        setState({ value, status: ENUMS.STATUS.LOADED, initialized: true });

        await dispatch('status', {
            event: ENUMS.STATUS.LOADED,
            objectId,
            value,
        });

        await dispatch(ENUMS.STATUS.LOADED, { objectId, value }, onLoad);

        _.defer(async () => {
            setState({ status: ENUMS.STATUS.READY });
            await dispatch('status', { event: ENUMS.STATUS.READY });
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

    const parseTitle = () => {
        if (state.id === 'new') return __('New User');

        let str = state.title;
        str = str.replace(/%id/gi, state.id);
        return str;
    };

    const reset = () => {
        if (isMounted()) setState({ value: {} });
    };

    const save = async value => {
        const saveMessage = __('Saving...');
        const alertObj = {
            color: Alert.ENUMS.COLOR.INFO,
            message: saveMessage,
            icon: 'Feather.UploadCloud',
        };

        setAlert(alertObj);
        setErrors(undefined);

        await dispatch(ENUMS.STATUS.VALIDATED, { value });
        await dispatch('status', { event: ENUMS.STATUS.VALIDATED, value });

        await dispatch(ENUMS.STATUS.SAVING, { value }, onSubmit);
        await dispatch('status', { event: ENUMS.STATUS.SAVING, value });
        await Reactium.Hook.run('media-submit', value);

        return Reactium.Media.save(value)
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
        if (unMounted() || isBusy() || !state.editing) return;
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
            await dispatch(ENUMS.STATUS.ERROR, { error }, onError);
            await dispatch('status', { event: ENUMS.STATUS.ERROR, error });
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

        await dispatch(ENUMS.STATUS.FAILED, { error, value }, onFail);
        await dispatch('status', {
            event: ENUMS.STATUS.FAILED,
            error,
            value,
        });

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

    const _onFormChange = e => {
        if (state.status === ENUMS.STATUS.LOADED) return;

        const { value: currentValue } = state;
        const { value: formValue } = e;

        if (_.isEqual(currentValue, formValue)) return;
        const value = { ...currentValue, ...formValue };
        setState({ value });
    };

    const _onFormSubmit = e => {
        const value = JSON.parse(JSON.stringify(e.value));
        return save(value);
    };

    const _onSuccess = async e => {
        const { file } = e;

        const alertObj = {
            color: Alert.ENUMS.COLOR.INFO,
            message: __('Save Complete!'),
            icon: 'Feather.Check',
        };

        setAlert(alertObj);

        setTimeout(() => {
            if (isMounted() && alertRef.current) {
                alertRef.current.hide();
            }
        }, 3000);

        setState({ value: file });

        await dispatch(ENUMS.STATUS.SAVED, { value: file }, onSuccess);
        await dispatch('status', {
            event: ENUMS.STATUS.SAVED,
            value: file,
        });

        let message = __('Saved %filename!');
        message = message.replace(/\%filename/gi, file.filename);

        Toast.show({
            icon: 'Feather.Check',
            message,
            type: Toast.TYPE.INFO,
        });

        return Promise.resolve(e);
    };

    const _onValidate = async e => {
        const { value, ...context } = e;

        await dispatch(ENUMS.STATUS.VALIDATING, { context, value }, onValidate);
        await dispatch('status', {
            event: ENUMS.STATUS.VALIDATING,
            context,
            value,
        });

        await Reactium.Hook.run('media-validate', { context, value });

        if (context.valid !== true) _onError(context);

        return { ...context, value };
    };

    const _handle = () => ({
        ...params,
        refs: {
            alertRef,
            formRef,
        },
        alert,
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
            const watch = ['value', 'id', 'objectId', 'editing'];

            const cstate = JSON.parse(JSON.stringify(op.get(state)));
            const pstate = JSON.parse(JSON.stringify(op.get(prevState)));

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
                    await dispatch('change', { changed });
                    if (!mounted()) return;
                    await dispatch('status', { event: 'change', changed });
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

    // Register handle
    useImperativeHandle(ref, () => handle, [handle]);
    //useRegisterHandle('MediaEditor', () => handle, [handle]);

    const render = () => {
        const type = op.get(state, 'value.type');
        if (state.value) console.log(state.value);

        return (
            <EventForm
                className={cname}
                onChange={_onFormChange}
                onSubmit={_onFormSubmit}
                ref={formRef}
                validator={_onValidate}
                value={state.value}>
                media editor
                <Zone zone={cx('main')} />
                <Sidebar editor={handle}>
                    <div className={cx('meta')}>
                        <Zone zone={cx('meta')} editor={handle} />
                        {type && (
                            <Zone
                                zone={cx(`meta-${String(type).toLowerCase()}`)}
                                editor={handle}
                            />
                        )}
                    </div>
                </Sidebar>
            </EventForm>
        );
    };

    return render();
};

Editor = forwardRef(Editor);

Editor.defaultProps = {
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
    title: 'Media',
};

export { Editor, Editor as default };
