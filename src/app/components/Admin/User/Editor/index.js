import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import ContentTabs from './Tabs';
import PropTypes from 'prop-types';
import { Icon } from '@atomic-reactor/reactium-ui';

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
    useHookComponent,
    useRegisterHandle,
    Zone,
} from 'reactium-core/sdk';

const noop = () => {};

const ENUMS = {
    DEBUG: false,
    STATUS: {
        FAILED: 'FAILED',
        ERROR: 'ERROR',
        INIT: 'INIT',
        LOADING: 'LOADING',
        LOADED: 'LOADED',
        READY: 'READY',
        SAVING: 'SAVING',
        SAVED: 'SAVED',
        SUCCESS: 'SUCCESS',
        VALIDATING: 'VALIDATING',
        VALIDATED: 'VALIDATED',
    },
    TEXT: {
        TITLE: __('User Edit | %id'),
    },
};

const debug = (...args) => {
    if (ENUMS.DEBUG === true) console.log(...args);
};

export class UserEvent extends CustomEvent {
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

const ErrorMessages = ({ editor, errors }) => {
    const canFocus = element => typeof element.focus === 'function';

    const jumpTo = (e, element) => {
        e.preventDefault();
        if (element.focus) element.focus();
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

let UserEditor = (
    {
        className,
        id: ComponentID,
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
    },
    ref,
) => {
    const { Alert, EventForm, Toast } = useHookComponent('ReactiumUI');

    const Helmet = useHookComponent('Helmet');

    const alertRef = useRef();
    const containerRef = useRef();
    const formRef = useRef();

    const defaultState = {
        ...params,
        clean: true,
        dirty: false,
        editing: op.get(params, 'tab') === 'edit',
        initialized: false,
        status: ENUMS.STATUS.INIT,
        title: op.get(props, 'title'),
        value: {},
    };

    const [alert, setNewAlert] = useState();

    const [errors, setErrors] = useState();

    const [, setUpdated] = useState();

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

    const setAvatar = avatar => {
        if (unMounted()) return;
        const value = { ...state.value, avatar };
        setState({ value });
    };

    const setState = newState => {
        if (unMounted()) return;
        setPrevState(JSON.parse(JSON.stringify(state)));
        update(newState);
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = cn(cx(), { [className]: !!className });

    const dispatch = async (eventType, event, callback) => {
        if (unMounted()) return;

        eventType = String(eventType).toUpperCase();

        // passive dirty events
        const dirtyEvents = _.pluck(Reactium.User.DirtyEvent.list, 'id');
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

        const evt = new UserEvent(eventType, event);
        handle.dispatchEvent(evt);
        debug(eventType, evt);

        await Reactium.Hook.run(`USER-${eventType}`, evt, handle);
        if (unMounted()) return;

        if (eventType === 'STATUS') callback = onStatus;
        if (typeof callback === 'function') await callback(evt);
        if (unMounted()) return;

        // passive clean events
        const scrubEvents = _.pluck(Reactium.User.ScrubEvent.list, 'id');
        if (scrubEvents.includes(String(eventType).toLowerCase())) {
            setState({ clean: event, dirty: false });
            await dispatch('clean', event);
            await dispatch('status', { event: 'clean', ...event });
        }
    };

    const getData = async objectId => {
        if (unMounted()) return;
        if (formRef.current) formRef.current.setValue(null);

        setState({ status: ENUMS.STATUS.LOADING, initialized: false });

        await dispatch('status', { event: ENUMS.STATUS.LOADING, objectId });
        await dispatch(ENUMS.STATUS.LOADING, { objectId });

        let value = isNew()
            ? {}
            : Reactium.User.selected
            ? Reactium.User.selected
            : await Reactium.User.retrieve({
                  objectId,
                  refresh: true,
                  verbose: true,
              });

        Reactium.User.selected = null;

        if (unMounted()) return;

        if (!isNew() && (!value || _.isEmpty(value))) {
            Reactium.Routing.history.replace('/admin/user/new');
            value = {};
            setState({
                value,
                status: ENUMS.STATUS.LOADED,
                initialized: true,
                editing: true,
            });
        } else {
            setState({ value, status: ENUMS.STATUS.LOADED, initialized: true });
        }

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
        if (isNew()) {
            setState({ editing: true });
        }

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

    const isNew = () => {
        const val = String(state.id).toLowerCase() === 'new' ? true : null;
        return val === true ? true : null;
    };

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
        value = { ...value, ...state.value };

        if (!state.editing) return;
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
        await Reactium.Hook.run('user-submit', value);

        return Reactium.User.save(value)
            .then(async response => {
                if (_.isError(response)) {
                    return Promise.reject(response);
                } else {
                    return _onSuccess({ user: response });
                }
            })
            .catch(error => _onFail({ error, value }));
    };

    const saveHotkey = e => {
        if (e) e.preventDefault();
        if (!state.editing) return;
        submit();
    };

    const showTab = (e, tab) => {
        if (e.currentTarget) e.currentTarget.blur();
        _.defer(() => setState({ tab }));
    };

    const submit = () => {
        if (unMounted() || isBusy() || !state.editing) return;
        formRef.current.submit();
    };

    const unMounted = () => !containerRef.current;

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

        let message = __('Unable to save %username');
        message = String(message).replace(
            /\%username/gi,
            op.get(value, 'username', 'user'),
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
        let value = { ...state.value, ...JSON.parse(JSON.stringify(e.value)) };
        return save(value);
    };

    const _onSuccess = async e => {
        const { user } = e;

        // If current user is being updated -> update cache
        if (Reactium.User.isCurrent(user)) {
            await Reactium.User.current(true).fetch();
        }

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

        if (isNew()) {
            Reactium.Routing.history.push(
                `/admin/user/${op.get(user, 'objectId')}/content`,
            );
        }

        setState({ value: user });

        await dispatch(ENUMS.STATUS.SAVED, { value: user }, onSuccess);
        await dispatch('status', {
            event: ENUMS.STATUS.SAVED,
            value: user,
        });

        let message = __('Saved %username!');
        message = message.replace(/\%username/gi, user.username);

        Toast.show({
            icon: 'Feather.UserCheck',
            message,
            type: Toast.TYPE.INFO,
        });

        return Promise.resolve(e);
    };

    const _onValidate = async e => {
        const { value, ...context } = e;

        // check password
        if (op.get(value, 'password')) {
            if (!op.get(value, 'confirm')) {
                context.valid = false;
                context.error['confirm'] = {
                    field: 'confirm',
                    focus: op.get(formRef.current, 'elements.confirm'),
                    message: __('confirm password'),
                };
            } else if (value.password !== value.confirm) {
                context.valid = false;
                context.error['confirm'] = {
                    field: 'confirm',
                    focus: op.get(formRef.current, 'elements.confirm'),
                    message: __('passwords do not match'),
                };
            }
        }

        await dispatch(ENUMS.STATUS.VALIDATING, { context, value }, onValidate);
        await dispatch('status', {
            event: ENUMS.STATUS.VALIDATING,
            context,
            value,
        });

        await Reactium.Hook.run('user-validate', { context, value });

        if (context.valid !== true) _onError(context);

        return { ...context, value };
    };

    const _handle = () => ({
        ...params,
        refs: {
            alertRef,
            containerRef,
            formRef,
        },
        alert,
        cx,
        dispatch,
        errors,
        forceUpdate,
        isBusy,
        isClean,
        isDirty,
        isMounted,
        isNew,
        parseErrorMessage,
        save,
        setAlert,
        setAvatar,
        setErrors,
        setState,
        showTab,
        state,
        submit,
        unMounted,
    });

    const [handle, updateHandle] = useEventHandle(_handle());

    // Initialize
    useEffect(initialize, [state.id]);

    // Save hotkey
    useEffect(() => {
        Reactium.Hotkeys.register('user-save', {
            callback: saveHotkey,
            key: 'mod+s',
            order: Reactium.Enums.priority.lowest,
            scope: document,
        });

        return () => {
            Reactium.Hotkeys.unregister('user-save');
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

    // Route changed to 'new'
    useEffect(() => {
        if (state.id !== params.id && params.id === 'new') reset();
    }, [params.id]);

    // Update if no tab
    useEffect(() => {
        if (!op.get(state, 'tab')) showTab('content');
    }, [state.id, op.get(state, 'tab')]);

    // Update route if no tab
    useEffect(() => {
        if (!state.id) return;

        if (!params.tab) {
            Reactium.Routing.history.replace(`/admin/user/${state.id}/content`);
        }
    }, [state.id, params.tab]);

    // Update route on state.tab change
    useEffect(() => {
        //if (!state.id) return;
        if (params.tab !== state.tab) {
            Reactium.Routing.history.replace(
                `/admin/user/${state.id}/${state.tab}`,
            );
        }
    });

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
    useRegisterHandle(ComponentID, () => handle, [handle]);

    // Render
    const render = () => {
        const { editing, value } = state;
        const reqs = isNew() ? ['email', 'username', 'password'] : ['email'];

        return (
            <div className={cname} ref={containerRef}>
                <Zone editor={handle} zone={cx('profile')} />

                {editing ? (
                    <EventForm
                        required={reqs}
                        id={ComponentID}
                        throttleChanges={false}
                        onChange={_onFormChange}
                        onSubmit={_onFormSubmit}
                        ref={formRef}
                        validator={_onValidate}
                        value={value}>
                        <Helmet>
                            <title>{parseTitle()}</title>
                        </Helmet>
                        <Zone editor={handle} zone={cx('form')} />
                    </EventForm>
                ) : (
                    <ContentTabs editor={handle} />
                )}
            </div>
        );
    };

    return render();
};

UserEditor = forwardRef(UserEditor);

UserEditor.propTypes = {
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
    title: PropTypes.string,
};

UserEditor.defaultProps = {
    namespace: 'admin-user-editor',
    onChange: noop,
    onError: noop,
    onFail: noop,
    onLoad: noop,
    onReady: noop,
    onStatus: noop,
    onSubmit: noop,
    onSuccess: noop,
    onValidate: noop,
    title: ENUMS.TEXT.TITLE,
};

export default UserEditor;
