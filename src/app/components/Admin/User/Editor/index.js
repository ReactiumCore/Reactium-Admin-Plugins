import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { EventForm } from '@atomic-reactor/reactium-ui';

//import { EventForm } from 'components/EventForm';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useRegisterHandle,
    Zone,
} from 'reactium-core/sdk';

const noop = () => {};

const ENUMS = {
    STATUS: {
        INIT: 'INIT',
        LOADING: 'LOADING',
        LOADED: 'LOADED',
        PENDING: 'PENDING',
        READY: 'READY',
        SAVING: 'SAVING',
        SAVED: 'SAVED',
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
        initialized: false,
        status: ENUMS.STATUS.INIT,
        title: op.get(props, 'title'),
        value: {},
    };

    const [prevState, setPrevState] = useDerivedState({ ...defaultState });

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
        }

        const evt = new UserEvent(eventType, event);
        handle.dispatchEvent(evt);
        debug(eventType, evt);

        await Reactium.Hook.run(`form-user-${eventType}`, evt, handle);
        if (unMounted()) return;

        if (eventType === 'status') callback = onStatus;
        if (typeof callback === 'function') await callback(evt);
        if (unMounted()) return;

        // passive clean/dirty events
        const dirtyEvents = _.pluck(Reactium.User.DirtyEvent.list, 'id');
        const scrubEvents = _.pluck(Reactium.User.ScrubEvent.list, 'id');

        if (dirtyEvents.includes(String(eventType).toLowerCase())) {
            setState({ dirty: event, clean: false });
            dispatch('dirty', event);
            dispatch('status', { event: 'dirty', ...event });
        }
        if (scrubEvents.includes(String(eventType).toLowerCase())) {
            setState({ clean: event, dirty: false });
            dispatch('clean', event);
            dispatch('status', { event: 'clean', ...event });
        }
    };

    const getData = async objectId => {
        if (unMounted()) return;
        formRef.current.setValue(null);

        setState({ status: ENUMS.STATUS.LOADING, initialized: false });

        dispatch('status', { event: ENUMS.STATUS.LOADING, objectId });
        dispatch(ENUMS.STATUS.LOADING, { objectId });

        const value = isNew() ? {} : await Reactium.User.retrieve({ objectId });

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

    const isClean = () => !isDirty();

    const isDirty = () => state.dirty === true;

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

    const saveHotkey = e => {
        if (e) e.preventDefault();
        submit();
    };

    const submit = () => {
        if (unMounted()) return;
        formRef.current.submit();
    };

    const unMounted = () => !formRef.current;

    const _onInitialize = () => {
        if (state.status === ENUMS.STATUS.INIT) {
            getData(state.id);
        }

        return () => {};
    };

    const initialize = _.once(_onInitialize);

    const _onFormChange = e => {
        if (state.status === ENUMS.STATUS.LOADED) return;

        const { value: currentValue } = state;
        const { value: formValue } = e;

        if (_.isEqual(currentValue, formValue)) return;
        const value = { ...currentValue, ...formValue };
        setState({ value });
    };

    const _onError = async context => {
        return context;
    };

    const _onValidate = async e => {
        const { value: val, ...context } = e;
        if (context.valid !== true) _onError(context);
        return { ...context, value };
    };

    const _handle = () => ({
        cx,
        isClean,
        isDirty,
        isMounted,
        setState,
        state,
        submit,
        unMounted,
    });

    const [handle, updateHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    useRegisterHandle(ComponentID, () => handle, [handle]);

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
    useEffect(() => {
        if (state.initialized !== true) return;

        const changed = {};
        const watch = ['value', 'id', 'objectId'];

        watch.forEach(field => {
            const current = op.get(state, field);
            const previous = op.get(prevState, field);

            if (!_.isEqual(current, previous))
                op.set(changed, field, { current, previous });
        });

        if (Object.keys(changed).length > 0) {
            if (op.has(changed, 'id')) {
                getData(changed.id.current);
            } else {
                dispatch('change', { changed });
                dispatch('status', { event: 'change', changed });
            }
        }
    }, [Object.values(state)]);

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
                    ref={formRef}
                    validator={_onValidate}
                    value={value}>
                    {objectId && <input type='hidden' name='objectId' />}
                    <input name='username' type='text' placeholder='username' />
                    <Zone zone={cx('form')} />
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
