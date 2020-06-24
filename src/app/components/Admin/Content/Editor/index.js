import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Region from './Region';
import PropTypes from 'prop-types';
import ContentEvent from '../_utils/ContentEvent';
import DEFAULT_ENUMS from 'components/Admin/Content/enums';
import useProperCase from 'components/Admin/Tools/useProperCase';
import useRouteParams from 'components/Admin/Tools/useRouteParams';
import { Alert, EventForm, Icon } from '@atomic-reactor/reactium-ui';

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
    useHandle,
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
        ...props
    },
    ref,
) => {
    const alertRef = useRef();
    const formRef = useRef();
    const sidebarRef = useRef();
    const ignoreChangeEvent = useRef(true);
    const loadingStatus = useRef(false);
    const Helmet = useHookComponent('Helmet');
    const Loading = useHookComponent(`${id}Loading`);
    const Sidebar = useHookComponent(`${id}Sidebar`);
    const SlugInput = useHookComponent('SlugInput');

    const tools = useHandle('AdminTools');

    const Toast = op.get(tools, 'Toast');

    let { type, slug, branch = 'master' } = useRouteParams([
        'type',
        'slug',
        'branch',
    ]);

    const alertDefault = {
        color: Alert.ENUMS.COLOR.INFO,
        icon: 'Feather.Flag',
    };

    const [contentType, setContentType] = useState();
    const [alert, setNewAlert] = useState(alertDefault);
    const [fieldTypes] = useState(Reactium.ContentType.FieldType.list);
    const [currentSlug, setCurrentSlug] = useState(slug);
    const [dirty, setNewDirty] = useState(true);
    const [errors, setErrors] = useState({});
    const [stale, setNewStale] = useState(false);
    const [status] = useState('pending');
    const [state, setState] = useDerivedState(props, ['title', 'sidebar']);
    const [types, setTypes] = useState();
    const [value, setNewValue] = useState();
    const [previous, setPrevious] = useState({});

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

    const setValue = (newValue = {}, checkReady = false) => {
        if (unMounted(checkReady)) return;
        newValue = { ...value, ...newValue };
        setNewValue(newValue);
    };

    // Functions

    const debug = (...args) => {
        const qstring = Reactium.Routing.history.location.search;
        if (!qstring) return;
        const params = new URLSearchParams(qstring);
        if (!params.get('debug')) return;
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
            await dispatch('load', { value: null }, onLoad);
            return Promise.resolve({});
        }

        const request = {
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

    const getTypes = refresh => Reactium.ContentType.types({ refresh });

    const unMounted = (checkReady = false) => {
        if (checkReady === true && !ready) return true;
        return !formRef.current;
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
        const { sidebar } = state;

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

    const reset = () => {
        ready = false;
        loadingStatus.current = undefined;
        ignoreChangeEvent.current = true;
        setNewValue(undefined);
    };

    const save = async (mergeValue = {}) => {
        setAlert();

        const newValue = { ...value, ...mergeValue };

        // only track branch for saves
        // always create new revision in current branch
        op.del(newValue, 'history.revision');

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

        return Reactium.Content.save(newValue, [], handle);
    };

    const setContentStatus = async status => {
        if (isNew()) return;

        setAlert();

        const newValue = { ...value, status };
        // only latest revision
        op.del(newValue, 'history.revision');

        if (!op.get(newValue, 'type')) {
            op.set(newValue, 'type', contentType);
        }

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
        const request = { ...value };
        op.set(request, 'history', { branch });
        const newValue = await Reactium.Content.retrieve(request);

        await handle.dispatch('load', {
            value: newValue,
            ignoreChangeEvent: true,
        });

        _.defer(() => {
            const slug = op.get(value, 'slug');
            if (branch === 'master') {
                Reactium.Routing.history.push(`/admin/content/${type}/${slug}`);
            } else {
                Reactium.Routing.history.push(
                    `/admin/content/${type}/${slug}/branch/${branch}`,
                );
            }
        });
    };

    const publish = async (action = 'publish') => {
        if (isNew()) return;

        setAlert();

        const newValue = { ...value, status };
        // only latest revision
        op.del(newValue, 'history.revision');

        if (!op.get(newValue, 'type')) {
            op.set(newValue, 'type', contentType);
        }

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

        const payload = {
            type,
            objectId: value.objectId,
            ...request,
        };

        if (!op.get(payload, 'type')) {
            op.set(payload, 'type', contentType);
        }

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

        const payload = {
            type,
            objectId: value.objectId,
            jobId,
        };

        if (!op.get(payload, 'type')) {
            op.set(payload, 'type', contentType);
        }

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

    const _onChange = async e => {
        if (e.value) setValue(e.value, true);
    };

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

    const _onFail = async (e, error, next) => {
        await dispatch('save-fail', { error }, onFail);

        const message = String(ENUMS.TEXT.SAVE_ERROR).replace('%type', type);

        Toast.show({
            icon: 'Feather.AlertOctagon',
            message,
            type: Toast.TYPE.ERROR,
        });

        if (isMounted()) setAlert(error);
        next();
    };

    const _onStatus = ({ detail }) =>
        dispatch('status', { event: detail }, onStatus);

    const _onSubmit = async e =>
        new Promise(async (resolve, reject) => {
            debug(e.value);
            await dispatch('submit', e.value, onSubmit);
            save(e.value)
                .then(async result => {
                    if (unMounted()) return;
                    await _onSuccess(e, result, resolve);
                })
                .catch(async error => {
                    if (unMounted()) return;
                    await _onFail(e, error, reject);
                });
        });

    const _onSuccess = async (e, result, next) => {
        const message = String(ENUMS.TEXT.SAVED).replace('%type', type);

        Toast.show({
            icon: 'Feather.Check',
            message,
            type: Toast.TYPE.INFO,
        });

        if (unMounted()) return;

        setValue(result);
        await dispatch(
            'save-success',
            { value: result, ignoreChangeEvent: true },
            onSuccess,
        );

        if (isNew() || result.slug !== slug) {
            _.defer(
                Reactium.Routing.history.push,
                `/admin/content/${type}/${result.slug}`,
            );
        }

        next();
    };

    const _onValidate = async e => {
        setErrors({});

        const { value: val, ...context } = e;
        await dispatch('validate', { context, value: val }, onValidate);

        if (context.valid !== true) _onError(context);
        return { ...context, value };
    };

    const saveHotkey = e => {
        if (e) e.preventDefault();
        submit();
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
        value,
    });

    const [handle, setHandle] = useEventHandle(_handle());
    useImperativeHandle(ref, () => handle, [handle]);
    useRegisterHandle(`${id}Editor`, () => handle, [handle]);

    // get content types
    useAsyncEffect(
        async mounted => {
            if (!type) return;
            const results = await getTypes(true);
            if (mounted()) setTypes(results);
            return () => {};
        },
        [type],
    );

    // get fullfilled handle
    let [ready] = useFulfilledObject(handle, ['contentType', 'type', 'types']);

    // slug change
    useEffect(() => {
        if (!slug) return;
        if (currentSlug !== slug) {
            reset();
            setCurrentSlug(slug);
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
        const newHandle = _handle();
        let equal = _.isEqual(newHandle, handle);
        if (equal === true) return;
        setHandle(newHandle);
    });

    // update handle refs
    useEffect(() => {
        handle.AlertBox = alertRef.current;
        handle.EventForm = formRef.current;
        handle.Sidebar = sidebarRef.current;
    });

    // dispatch ready
    useEffect(() => {
        if (ready === true)
            dispatch('status', { event: 'READY', ready }, onReady);
    }, [ready]);

    // dispatch status
    useEffect(() => {
        if (ready !== true || !formRef.current) return;
        formRef.current.addEventListener('status', _onStatus);
        return () => {
            formRef.current.removeEventListener('status', _onStatus);
        };
    }, [ready]);

    // dispatch change
    useEffect(() => {
        if (!ready || !value) {
            return;
        }

        if (_.isEqual(previous, value)) {
            return;
        }

        setPrevious(value);

        if (_.isEmpty(previous)) return;

        dispatch('change', { previous, value }, onChange);
    }, [value]);

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
    useEffect(() => {
        if (loadingStatus.current) return;
        if (!formRef.current || !slug || !type || value) return;
        getContent()
            .then(result => {
                if (unMounted()) return;
                if (!result) return;
                ignoreChangeEvent.current = true;
                setClean({ value: result });
            })
            .catch(error => {
                Reactium.Routing.history.push(`/admin/content/${type}/new`);
                _.defer(() => {
                    Toast.show({
                        icon: 'Feather.AlertOctagon',
                        message: __('Error loading content'),
                        type: Toast.TYPE.ERROR,
                    });
                    console.error({ error });
                });
            });
    });

    const render = () => {
        if (ready !== true) return <Loading />;
        const { title } = state;
        const currentValue = value || {};
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
};

export default ContentEditor;
