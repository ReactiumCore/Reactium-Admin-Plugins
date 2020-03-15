import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
//import { EventForm } from '@atomic-reactor/reactium-ui';

import { EventForm } from 'components/EventForm';

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
    STATUS: {
        FAILED: 'FAILED',
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
        TITLE: __('Edit User %id'),
    },
};

const debug = (...args) => {
    const qstring = Reactium.Routing.history.location.search;
    if (!qstring) return;
    const params = new URLSearchParams(qstring);
    if (!params.get('debug')) return;
    console.log(...args);
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

let UserEditor = (
    {
        className,
        id: ComponentID,
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
    const formRef = useRef();

    const Helmet = useHookComponent('Helmet');

    const defaultState = {
        ...params,
        clean: true,
        dirty: false,
        editing: op.has(params, 'edit'),
        initialized: false,
        status: ENUMS.STATUS.INIT,
        title: op.get(props, 'title'),
        value: {},
    };

    const [prevState, setPrevState] = useDerivedState({
        ...defaultState,
        id: null,
    });

    const [state, update] = useDerivedState(
        {
            ...defaultState,
            errors: {},
            value: {},
        },
        ['dirty', 'id', 'initialized', 'status', 'title'],
    );

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

        if (op.has(event, 'event')) {
            op.set(event, 'event', String(event.event).toUpperCase());
            if (eventType === 'STATUS') {
                setState({ status: event.event });
            }
        }

        const evt = new UserEvent(eventType, event);
        handle.dispatchEvent(evt);
        debug(eventType, evt);

        await Reactium.Hook.run(`form-user-${eventType}`, evt, handle);
        if (unMounted()) return;

        if (eventType === 'STATUS') callback = onStatus;
        if (typeof callback === 'function') await callback(evt);
        if (unMounted()) return;

        // passive clean/dirty events
        const dirtyEvents = _.pluck(Reactium.User.DirtyEvent.list, 'id');
        const scrubEvents = _.pluck(Reactium.User.ScrubEvent.list, 'id');

        if (dirtyEvents.includes(String(eventType).toLowerCase())) {
            setState({ dirty: event, clean: false });
            await dispatch('dirty', event);
            await dispatch('status', { event: 'dirty', ...event });
        }
        if (scrubEvents.includes(String(eventType).toLowerCase())) {
            setState({ clean: event, dirty: false });
            await dispatch('clean', event);
            await dispatch('status', { event: 'clean', ...event });
        }
    };

    const getData = async objectId => {
        if (unMounted()) return;
        formRef.current.setValue(null);

        setState({ status: ENUMS.STATUS.LOADING, initialized: false });

        dispatch('status', { event: ENUMS.STATUS.LOADING, objectId });
        dispatch(ENUMS.STATUS.LOADING, { objectId });

        const value = isNew()
            ? {}
            : Reactium.User.selected
            ? Reactium.User.selected
            : await Reactium.User.retrieve({ objectId });

        Reactium.User.selected = null;

        if (unMounted()) return;

        setState({ value, status: ENUMS.STATUS.LOADED, initialized: true });

        dispatch('status', {
            event: ENUMS.STATUS.LOADED,
            objectId,
            value,
        });
        dispatch(ENUMS.STATUS.LOADED, { objectId, value }, onLoad);
        _.defer(() => {
            setState({ status: ENUMS.STATUS.READY });
            dispatch('status', { event: ENUMS.STATUS.READY });
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
        if (!state.editing) return;
        await dispatch(ENUMS.STATUS.VALIDATED, { value });
        await dispatch('status', { event: ENUMS.STATUS.VALIDATED, value });

        await dispatch(ENUMS.STATUS.SAVING, { value });
        await dispatch('status', { event: ENUMS.STATUS.SAVING, value });
        await Reactium.Hook.run('user-submit', value);

        const updatedUser = await Reactium.User.save(value);

        if (isNew()) {
            Reactium.Routing.history.push(
                `/admin/user/${op.get(updatedUser, 'objectId')}`,
            );
        }

        setState({ value: updatedUser });
    };

    const saveHotkey = e => {
        if (e) e.preventDefault();
        if (!state.editing) return;
        submit();
    };

    const submit = () => {
        if (unMounted() || isBusy() || !state.editing) return;
        formRef.current.submit();
    };

    const unMounted = () => !formRef.current;

    const _onError = async context => {
        return context;
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

    const _onValidate = async e => {
        const { value, ...context } = e;
        if (context.valid !== true) _onError(context);

        await dispatch(ENUMS.STATUS.VALIDATING, { context, value });
        await dispatch('status', {
            event: ENUMS.STATUS.VALIDATING,
            context,
            value,
        });
        await Reactium.Hook.run('user-validate', { context, value });

        return { ...context, value };
    };

    const _handle = () => ({
        cx,
        dispatch,
        isBusy,
        isClean,
        isDirty,
        isMounted,
        isNew,
        save,
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

            watch.forEach(field => {
                const current = op.get(state, field);
                const previous = op.get(prevState, field);

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

    // Route change /edit
    useEffect(() => {
        if (params.id !== state.editing && !isNew()) {
            let route = `/admin/user/${params.id}`;
            route += state.editing === true ? '/edit' : '';
            Reactium.Routing.history.replace(route);
        }
    }, [state.editing]);

    // Update handle
    useEffect(() => {
        updateHandle(_handle());
    }, [Object.values(state)]);

    // Register handle
    useImperativeHandle(ref, () => handle, [handle]);
    useRegisterHandle(ComponentID, () => handle, [handle]);

    // Render
    const render = () => {
        const { value } = state;
        const { objectId } = value;

        return (
            <>
                <Helmet>
                    <title>{parseTitle()}</title>
                </Helmet>
                <EventForm
                    id={ComponentID}
                    className={cname}
                    onChange={_onFormChange}
                    onSubmit={_onFormSubmit}
                    ref={formRef}
                    validator={_onValidate}
                    value={value}>
                    {objectId && <input type='hidden' name='objectId' />}
                    <Zone editor={handle} zone={cx('form')} />
                </EventForm>
            </>
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
