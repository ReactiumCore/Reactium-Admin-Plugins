import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Region from './Region';
import PropTypes from 'prop-types';
import ContentEvent from '../_utils/ContentEvent';
import DEFAULT_ENUMS from 'reactium_modules/@atomic-reactor/reactium-admin-content/Content/enums';
import useProperCase from 'reactium_modules/@atomic-reactor/reactium-admin-core/Tools/useProperCase';

import React, {
    forwardRef,
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
    useFulfilledObject,
    useHookComponent,
    useRegisterHandle,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ContentEditor
 * -----------------------------------------------------------------------------
 */
const noop = () => {};

const ErrorMessages = ({ editor, errors }) => {
    const { Icon } = useHookComponent('ReactiumUI');
    const canFocus = element => {
        if (!element) return false;
        return typeof element.focus === 'function';
    };

    const jumpTo = (e, element) => {
        e.preventDefault();
        element.focus();
    };

    return (
        <ul className={editor.cx('errors')}>
            {errors.map(({ message, field, focus, value = '' }, i) => {
                const replacers = {
                    '%fieldName': field,
                    '%type': editor.type,
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

let ContentEditor = (
    {
        ENUMS,
        className,
        id,
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
        sidebar = true,
        ...props
    },
    ref,
) => {
    const debugMode = ['on', 'true', '1'].includes(
        op.get(props, 'search.debug'),
    );
    const stackTraceMode = ['on', 'true', '1'].includes(
        op.get(props, 'search.stack'),
    );

    const alertRef = useRef();
    const formRef = useRef();
    const loadingRef = useRef();
    const sidebarRef = useRef();
    const valueRef = useRef({});
    const ignoreChangeEvent = useRef(true);
    const loadingStatus = useRef(false);
    const Helmet = useHookComponent('Helmet');
    const Loading = useHookComponent(`${id}Loading`);
    const Sidebar = useHookComponent(`${id}Sidebar`);
    const SlugInput = useHookComponent('SlugInput');

    const { Alert, EventForm, Icon, Toast } = useHookComponent('ReactiumUI');

    const alertDefault = {
        color: Alert.ENUMS.COLOR.INFO,
        icon: 'Feather.Flag',
    };

    const [contentType, setContentType] = useState();
    const [alert, setNewAlert] = useState(alertDefault);
    const [fieldTypes, setFieldTypes] = useState(
        Reactium.ContentType.FieldType.list,
    );
    const [propState] = useDerivedState(props, [
        'params.type',
        'params.slug',
        'search.branch',
    ]);
    const type = op.get(propState, 'params.type');
    const slug = op.get(propState, 'params.slug', 'new');
    const branch = op.get(propState, 'search.branch', 'master');
    const currentSlug = op.get(valueRef.current, 'slug');

    const [dirty, setNewDirty] = useState(true);
    const [errors, setErrors] = useState({});
    const [stale, setNewStale] = useState(false);
    const [status] = useState('pending');
    const [state, _setState] = useState({});
    const setState = (val = {}) => {
        if (unMounted()) return;

        const newState = {
            ...state,
            ...(val || {}),
        };

        debug('setState', { val, newState });

        _setState(newState);
        //_.defer(() => _setState({ ...newState, update: Date.now() }));
    };

    const [types, setTypes] = useState();

    // Aliases prevent memory leaks
    const setAlert = newAlert => {
        if (unMounted()) return;

        newAlert = _.isObject(newAlert) ? newAlert : alertDefault;

        const { color, icon, message } = newAlert;

        if (message) {
            if (!icon) op.set(newAlert, 'icon', 'Feather.AlertOctagon');
            if (!color) op.set(newAlert, 'color', Alert.ENUMS.COLOR.DANGER);
        }

        setNewAlert(newAlert);
    };

    const setClean = (params = {}) => {
        if (unMounted()) return;

        setNewDirty(false);

        const newValue = op.get(params, 'value', op.get(params, 'content'));

        if (newValue) setValue(newValue);
        dispatch('clean', { value: newValue });
    };

    const setDirty = (params = {}) => {
        if (unMounted()) return;

        const newValue = op.get(params, 'value');

        setNewDirty(true);

        if (unMounted()) return;
        if (newValue) setValue(newValue);
        dispatch('dirty', { value: newValue });
    };

    const setStale = val => {
        if (unMounted()) return;

        setNewStale(val);

        _.defer(() => {
            if (unMounted()) return;
            dispatch('stale', { stale: val });
        });
    };

    const setValue = (newValue, forceUpdate = false) => {
        if (unMounted()) return;
        if (_.isObject(newValue)) {
            const { value = {} } = state;
            newValue = { ...value, ...newValue };
        } else {
            newValue = null;
        }

        valueRef.current = newValue || {};

        if (forceUpdate === true) {
            update(valueRef.current);
        } else {
            op.set(handle, 'value', newValue);
        }
    };

    const update = newValue => {
        if (unMounted()) return;
        setState({ value: newValue });
    };

    // Functions
    const debug = (...args) => {
        if (!debugMode) return;
        if (stackTraceMode) args.push(new Error().stack);
        console.log(...args);
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = cn(cx(), { [className]: !!className });

    const dispatch = async (eventType, event, callback) => {
        if (unMounted()) return;
        if (eventType === 'change' && ignoreChangeEvent.current === true) {
            ignoreChangeEvent.current = false;
            return;
        } else {
            if (op.get(event, 'ignoreChangeEvent') === true) {
                ignoreChangeEvent.current = true;
            }
        }

        // dispatch exact eventType
        const evt = new ContentEvent(eventType, event);
        if (eventType !== 'status') {
            handle.dispatchEvent(evt);
        }

        // dispatch status event
        const statusType =
            eventType === 'status' ? op.get(event, 'event') : eventType;

        const statusEvt = new ContentEvent('status', {
            ...event,
            event: String(statusType).toUpperCase(),
        });

        debug('dispatch:', eventType, statusEvt.event, handle.value, event);

        handle.dispatchEvent(statusEvt);

        // dispatch exact reactium hook
        await Reactium.Hook.run(`form-${type}-${eventType}`, evt, handle);

        // dispatch status reactium hook
        await Reactium.Hook.run(`form-${type}-status`, statusEvt, handle);

        // dispatch generic status reactium hook
        await Reactium.Hook.run('form-editor-status', statusEvt, type, handle);

        // execute basic callback
        if (typeof callback === 'function') await callback(evt);

        // passive clean/dirty events
        const dirtyEvents = _.pluck(Reactium.Content.DirtyEvent.list, 'id');
        const scrubEvents = _.pluck(Reactium.Content.ScrubEvent.list, 'id');

        if (dirtyEvents.includes(eventType)) _.defer(() => setDirty(event));
        if (scrubEvents.includes(eventType)) _.defer(() => setClean(event));
    };

    const getContent = async () => {
        loadingStatus.current = Date.now();

        if (isNew()) {
            await dispatch('load', { value: {} }, onLoad);
            loadingStatus.current = undefined;
            return Promise.resolve({});
        }

        const request = {
            refresh: true,
            type: contentType,
            slug,
            history: {
                branch,
            },
        };

        const content = await Reactium.Content.retrieve(request);

        if (content) {
            await dispatch('load', { value: content }, onLoad);
            loadingStatus.current = undefined;
            return Promise.resolve(content);
        } else {
            const message = (
                <span>
                    Unable to find {properCase(type)}:{' '}
                    <span className='red strong'>{slug}</span>
                </span>
            );
            _onError({ message });
            return Promise.reject(message);
        }
    };

    const getTypes = () => Reactium.ContentType.types();

    const unMounted = () => {
        return !formRef.current && !loadingRef.current;
    };

    const isClean = () => dirty !== true;

    const isDirty = () => dirty === true;

    const isMounted = (checkReady = false) => {
        if (unMounted(checkReady)) return false;
        return true;
    };

    const isNew = () => {
        const val = String(slug).toLowerCase() === 'new' ? true : null;
        return val === true ? true : null;
    };

    const isStale = () => stale;

    const parseErrorMessage = (str, replacers = {}) => {
        Object.entries(replacers).forEach(([key, value]) => {
            str = str.split(key).join(value);
        });

        return str;
    };

    const properCase = useProperCase();

    const regions = () => {
        const _regions = op.get(contentType, 'regions', {});

        const contentRegions = sidebar
            ? _.without(Object.keys(_regions), 'sidebar').map(
                  key => _regions[key],
              )
            : Object.values(_regions);

        const sidebarRegions = sidebar
            ? _.compact([op.get(_regions, 'sidebar')])
            : [];

        return [contentRegions, sidebarRegions];
    };

    const reset = async () => {
        loadingStatus.current = undefined;
        ignoreChangeEvent.current = true;
        setValue(undefined, true);
        if (isNew() && formRef.current) {
            _.defer(() => {
                if (unMounted()) return;
                if (formRef.current) formRef.current.setValue(null);
            });
        }
    };

    const save = async (mergeValue = {}) => {
        setAlert();

        const { value = {} } = state;
        const newValue = { ...value, ...mergeValue };

        Toast.show({
            toastId: 'content-save',
            icon: 'Feather.UploadCloud',
            message: String(ENUMS.TEXT.SAVING).replace('%type', type),
            type: Toast.TYPE.INFO,
            autoClose: false,
            closeButton: false,
        });

        // only track branch for saves
        // always create new revision in current branch
        op.del(newValue, 'history.revision');

        await dispatch('content-parse', {
            value: newValue,
            dispatcher: 'ContentEditor.save',
        });

        await dispatch('before-save', { value: newValue });

        if (!op.get(newValue, 'type')) {
            op.set(newValue, 'type', contentType);
        }

        const newSlug = op.get(newValue, 'slug');

        if (!isNew() && newSlug !== slug) {
            await Reactium.Content.changeSlug({
                objectId: op.get(newValue, 'objectId'),
                newSlug,
                type: contentType,
            });

            op.del(newValue, 'slug');
            op.del(newValue, 'uuid');
        } else {
            if (isNew() && !op.get(newValue, 'slug')) {
                op.set(newValue, 'slug', `${type}-${uuid()}`);
            }
        }

        await dispatch('save', { value: newValue }, onChange);

        return Reactium.Content.save(newValue, [], handle)
            .then(async result => {
                if (unMounted()) return;
                await dispatch(
                    'save-success',
                    { value: result, ignoreChangeEvent: true },
                    _onSuccess,
                );
            })
            .catch(async error => {
                if (unMounted()) return;
                await dispatch('save-fail', { error }, _onFail);
            });
    };

    const setContentStatus = async status => {
        if (isNew()) return;

        setAlert();
        const { value = {} } = state;
        const newValue = { ...value, status };
        // only latest revision
        op.del(newValue, 'history.revision');

        if (!op.get(newValue, 'type')) {
            op.set(newValue, 'type', contentType);
        }

        await dispatch('content-parse', {
            value: newValue,
            dispatcher: 'ContentEditor.setContentStatus',
        });

        await dispatch('before-content-set-status', { value: newValue });

        try {
            const contentObj = await Reactium.Content.setStatus(
                newValue,
                handle,
            );
            if (unMounted()) return;

            await dispatch(
                'content-set-status',
                { value: contentObj, ignoreChangeEvent: true },
                setClean,
            );
            Toast.show({
                icon: 'Feather.Check',
                message: __('Content status %status').replace(
                    '%status',
                    status,
                ),
                type: Toast.TYPE.INFO,
            });
        } catch (error) {
            Toast.show({
                icon: 'Feather.AlertOctagon',
                message: __('Content status change failed'),
                type: Toast.TYPE.ERROR,
            });
            console.error({ error });
        }
    };

    const setBranch = async branch => {
        const { value = {} } = state;
        const request = { ...value };

        op.set(request, 'history', { branch });
        const newValue = await Reactium.Content.retrieve(request);

        await dispatch('content-parse', {
            value: newValue,
            dispatcher: 'ContentEditor.setBranch',
        });

        await handle.dispatch('load', {
            value: newValue,
            ignoreChangeEvent: true,
        });

        _.defer(() => {
            const slug = op.get(value, 'slug');
            if (branch === 'master') {
                window.location.href = `/admin/content/${type}/${slug}`;
            } else {
                window.location.href = `/admin/content/${type}/${slug}/branch/${branch}`;
            }
        });
    };

    const publish = async (action = 'publish') => {
        if (isNew()) return;

        setAlert();
        const { value = {} } = state;
        const newValue = { ...value, status };
        // only latest revision
        op.del(newValue, 'history.revision');

        if (!op.get(newValue, 'type')) {
            op.set(newValue, 'type', contentType);
        }

        await dispatch('content-parse', {
            value: newValue,
            dispatcher: 'ContentEditor.publish',
        });

        await dispatch(`before-${action}`, { value: newValue });

        const successMessage = {
            publish: __('%type published').replace('%type', type),
            unpublish: __('%type unpublished').replace('%type', type),
        };
        const errorMessage = {
            publish: __('Unable to publish %type').replace('%type', type),
            unpublish: __('Unable to unpublish %type').replace('%type', type),
        };

        try {
            const contentObj = await Reactium.Content[action](newValue, handle);
            if (unMounted()) return;

            await dispatch(
                action,
                { value: contentObj, ignoreChangeEvent: true },
                setClean,
            );
            Toast.show({
                icon: 'Feather.Check',
                message: successMessage[action],
                type: Toast.TYPE.INFO,
            });
        } catch (error) {
            Toast.show({
                icon: 'Feather.AlertOctagon',
                message: errorMessage[action],
                type: Toast.TYPE.ERROR,
            });
            console.error({ error });
        }
    };

    const schedule = async (request = {}) => {
        if (isNew()) return;

        setAlert();

        const { value = {} } = state;

        const payload = {
            type,
            objectId: value.objectId,
            ...request,
        };

        if (!op.get(payload, 'type')) {
            op.set(payload, 'type', contentType);
        }

        await dispatch('content-parse', {
            value: newValue,
            dispatcher: 'ContentEditor.schedule',
        });

        await dispatch('before-schedule', { value: payload });

        const successMessage = __('%type scheduled').replace('%type', type);
        const errorMessage = __('Unable to schedule %type').replace(
            '%type',
            type,
        );

        try {
            const response = await Reactium.Content.schedule(payload, handle);
            const newValue = {
                ...value,
                publish: response.publish,
            };

            if (unMounted()) return;

            await dispatch(
                'schedule',
                { value: newValue, ignoreChangeEvent: true },
                isDirty() ? setDirty : setClean,
            );

            Toast.show({
                icon: 'Feather.Check',
                message: successMessage,
                type: Toast.TYPE.INFO,
            });
        } catch (error) {
            Toast.show({
                icon: 'Feather.AlertOctagon',
                message: errorMessage,
                type: Toast.TYPE.ERROR,
            });
            console.error({ error });
        }
    };

    const unschedule = async jobId => {
        if (isNew()) return;

        setAlert();

        const { value = {} } = state;

        const payload = {
            type,
            objectId: value.objectId,
            jobId,
        };

        if (!op.get(payload, 'type')) {
            op.set(payload, 'type', contentType);
        }

        await dispatch('content-parse', {
            value: newValue,
            dispatcher: 'ContentEditor.unschedule',
        });

        await dispatch('before-unschedule', { value: payload });
        const successMessage = __('%type unscheduled').replace('%type', type);
        const errorMessage = __('Unable to unschedule %type').replace(
            '%type',
            type,
        );

        try {
            const response = await Reactium.Content.unschedule(payload, handle);
            const newValue = {
                ...value,
                publish: response.publish,
            };

            if (unMounted()) return;

            await dispatch(
                'unschedule',
                { value: newValue, ignoreChangeEvent: true },
                isDirty() ? setDirty : setClean,
            );

            Toast.show({
                icon: 'Feather.Check',
                message: successMessage,
                type: Toast.TYPE.INFO,
            });
        } catch (error) {
            Toast.show({
                icon: 'Feather.AlertOctagon',
                message: errorMessage,
                type: Toast.TYPE.ERROR,
            });
            console.error({ error });
        }
    };

    const submit = () => formRef.current.submit();

    const _onChange = async ({ value }) => setValue(value);

    const _onError = async context => {
        const { error } = context;
        const errors = Object.values(error);

        const alertObj = {
            message: <ErrorMessages errors={errors} editor={handle} />,
            icon: 'Feather.AlertOctagon',
            color: Alert.ENUMS.COLOR.DANGER,
        };

        await dispatch('save-error', { error }, onError);
        if (isMounted()) {
            setErrors(error);
            setAlert(alertObj);
        }

        return context;
    };

    const _onFail = async e => {
        const error = e.error;
        const Msg = () => (
            <span>
                <Icon name='Feather.AlertOctagon' style={{ marginRight: 8 }} />
                {String(ENUMS.TEXT.SAVE_ERROR).replace('%type', type)}
            </span>
        );

        Toast.update('content-save', {
            render: <Msg />,
            autoClose: 1000,
            closeOnClick: true,
            type: Toast.TYPE.ERROR,
        });
        console.error(error);

        if (isMounted()) setAlert(error);
        onFail(e);
    };

    const _onStatus = ({ detail }) =>
        dispatch('status', { event: detail }, onStatus);

    const _onSubmit = async e => {
        debug(e.value);
        await dispatch('submit', e.value, onSubmit);
        save(e.value);
    };

    const _onSuccess = async e => {
        const result = e.value;

        const Msg = () => (
            <span>
                <Icon name='Feather.Check' style={{ marginRight: 8 }} />
                {String(ENUMS.TEXT.SAVED).replace('%type', type)}
            </span>
        );

        Toast.update('content-save', {
            render: <Msg />,
            autoClose: 1000,
            closeOnClick: true,
            type: Toast.TYPE.SUCCESS,
        });

        setValue(result, true);

        if (isNew() || result.slug !== slug) {
            _.defer(
                Reactium.Routing.history.push,
                `/admin/content/${type}/${result.slug}`,
            );
        }

        onSuccess(e);
    };

    const _onValidate = async e => {
        setErrors({});

        const { value = {} } = state;
        const { value: val, ...context } = e;
        await dispatch('validate', { context, value: val }, onValidate);

        if (context.valid !== true) _onError(context);
        return { ...context, value };
    };

    const saveHotkey = e => {
        if (e) e.preventDefault();
        submit();
    };

    const pulse = () => {
        const { value = {} } = state;

        const slug = op.get(value, 'slug');
        const currentSlug = op.get(valueRef.current, 'slug');
        if (
            slug === currentSlug &&
            Object.values(value).length > 0 &&
            !_.isEqual(value, valueRef.current)
        ) {
            update(valueRef.current);
            dispatch(
                'change',
                { previous: value, value: valueRef.current },
                onChange,
            );
        }
    };

    const isReady = () => ready === true;

    const isLoading = () => {
        if (!isReady()) return true;
        if (!isNew() && slug !== currentSlug) return true;
        return false;
    };

    // Handle
    const _handle = () => ({
        AlertBox: alertRef.current,
        EventForm: formRef.current,
        Sidebar: sidebarRef.current,
        alert: setAlert,
        contentType,
        cx,
        dispatch,
        errors,
        fieldTypes,
        id,
        isClean,
        isDirty,
        isMounted,
        isNew,
        isStale,
        parseErrorMessage,
        properCase,
        ready,
        regions,
        save,
        slug,
        state,
        setContentStatus,
        setStale,
        setBranch,
        schedule,
        unschedule,
        publish,
        setClean,
        setDirty,
        setStale,
        setState,
        setValue,
        submit,
        type,
        types,
        unMounted,
        value: valueRef.current,
    });

    const [handle, setHandle] = useEventHandle(_handle());
    useImperativeHandle(ref, () => handle, [handle]);
    useRegisterHandle(`${id}Editor`, () => handle, [handle]);

    // get content types
    useAsyncEffect(
        async mounted => {
            if (!type) return;
            const results = await getTypes();
            if (mounted()) setTypes(results);
            return () => {};
        },
        [type],
    );

    // get fullfilled handle
    let [ready] = useFulfilledObject(handle, [
        'contentType',
        'type',
        'types',
        'slug',
    ]);

    // slug change
    useEffect(() => {
        if (slug !== currentSlug) {
            if (isNew()) {
                reset();
            } else {
                loadingStatus.current = undefined;
            }
        }
    }, [currentSlug, slug]);

    // set content type
    useEffect(() => {
        if (!type) return;
        const t = _.findWhere(types, { type });
        if (!t) return;
        setContentType(t);
    }, [type, types]);

    // update title
    useEffect(() => {
        if (!type) return;
        const newTitle = properCase(`${type} ${ENUMS.TEXT.EDITOR}`);
        if (op.get(state, 'title') === newTitle) return;
        setState({ title: newTitle });
    }, [type]);

    // update handle
    useEffect(() => {
        const hnd = _handle();
        if (_.isEqual(hnd, handle) === true) return;
        Object.keys(hnd).forEach(key => op.set(handle, key, hnd[key]));
        setHandle(handle);
    });

    // update handle refs
    useEffect(() => {
        handle.AlertBox = alertRef.current;
        handle.EventForm = formRef.current;
        handle.Sidebar = sidebarRef.current;
        handle.value = valueRef.current;
    });

    // dispatch ready
    useEffect(() => {
        if (isReady() === true) {
            dispatch('status', { event: 'READY', ready }, onReady);
        }
    }, [isReady()]);

    // dispatch status
    useEffect(() => {
        if (ready !== true || !formRef.current) return;
        formRef.current.addEventListener('status', _onStatus);
        return () => {
            formRef.current.removeEventListener('status', _onStatus);
        };
    }, [ready]);

    // save hotkey
    useEffect(() => {
        if (ready !== true) return;
        Reactium.Hotkeys.register('content-save', {
            callback: saveHotkey,
            key: 'mod+s',
            order: Reactium.Enums.priority.lowest,
            scope: document,
        });

        return () => {
            Reactium.Hotkeys.unregister('content-save');
        };
    }, [ready]);

    // get content
    useAsyncEffect(() => {
        if (ready !== true || isNew()) return;
        if (loadingStatus.current) return;
        if (unMounted() || !slug || !type) return;

        getContent()
            .then(result => {
                if (unMounted()) return;
                if (!result) return;

                setClean({ value: result });
                setValue(result, true);
            })
            .catch(error => {
                window.location.href = `/admin/content/${type}/new`;
                _.defer(() => {
                    Toast.show({
                        icon: 'Feather.AlertOctagon',
                        message: __('Error loading content'),
                        type: Toast.TYPE.ERROR,
                    });
                    console.error({ error });
                });
            });
    }, [ready, isNew()]);

    // create pulse
    useEffect(() => {
        if (!ready) return;
        Reactium.Pulse.register('content-editor', pulse, { delay: 250 });
        return () => Reactium.Pulse.unregister('content-editor');
    }, [ready]);

    // clear on unmount
    useEffect(() => {
        return () => {
            valueRef.current = {};
            handle.value = valueRef.current;
            handle.state = {};
            reset();
        };
    }, []);

    // scroll to top
    useEffect(() => {
        if (isLoading()) return;
        if (typeof window === 'undefined') return;
        document.body.scrollTop = 0;
    }, [isLoading(), isNew()]);

    // Field types
    useEffect(() => {
        const updated = { ...fieldTypes };
        Reactium.Hook.runSync('content-type-field-type-list', updated);
        setFieldTypes(updated);
    }, []);

    const render = () => {
        if (isLoading()) return <Loading ref={loadingRef} />;
        const { title, value = {} } = state;
        const currentValue = valueRef.current || {};
        const [contentRegions, sidebarRegions] = regions();

        return (
            <>
                <Helmet>
                    <title>{title}</title>
                </Helmet>
                <EventForm
                    className={cname}
                    ref={formRef}
                    onChange={_onChange}
                    onSubmit={_onSubmit}
                    validator={_onValidate}
                    value={currentValue}>
                    {op.get(currentValue, 'objectId') && (
                        <input type='hidden' name='objectId' />
                    )}
                    {value && contentRegions.length > 0 && (
                        <div className={cx('editor')}>
                            <div className={cx('regions')}>
                                {op.get(alert, 'message') && (
                                    <div className={cx('editor-region')}>
                                        <Alert
                                            dismissable
                                            ref={alertRef}
                                            onHide={() =>
                                                setAlert(alertDefault)
                                            }
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
                                <SlugInput editor={handle} />
                                {contentRegions.map(item => (
                                    <Region
                                        key={item.slug}
                                        editor={handle}
                                        {...item}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {value && sidebarRegions.length > 0 && (
                        <Sidebar editor={handle} ref={sidebarRef}>
                            <div className={cx('meta')}>
                                <div className={cx('regions')}>
                                    {sidebarRegions.map(item => (
                                        <Region
                                            key={item.slug}
                                            editor={handle}
                                            {...item}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Sidebar>
                    )}
                </EventForm>
            </>
        );
    };

    return render();
};

ContentEditor = forwardRef(ContentEditor);

ContentEditor.propTypes = {
    ENUMS: PropTypes.object,
    className: PropTypes.string,
    id: PropTypes.string,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    onFail: PropTypes.func,
    onLoad: PropTypes.func,
    onReady: PropTypes.func,
    onStatus: PropTypes.func,
    onSubmit: PropTypes.func,
    onSuccess: PropTypes.func,
    onValidate: PropTypes.func,
    sidebar: PropTypes.bool,
    title: PropTypes.string,
    value: PropTypes.object,
};

ContentEditor.defaultProps = {
    ENUMS: DEFAULT_ENUMS,
    namespace: 'admin-content',
    onChange: noop,
    onError: noop,
    onFail: noop,
    onLoad: noop,
    onReady: noop,
    onStatus: noop,
    onSubmit: noop,
    onSuccess: noop,
    onValidate: noop,
    sidebar: true,
    title: DEFAULT_ENUMS.TEXT.EDITOR,
    value: null,
};

export default ContentEditor;
