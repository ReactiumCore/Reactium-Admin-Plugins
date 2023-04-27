import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

import Reactium, {
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
} from '@atomic-reactor/reactium-sdk-core';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect as useWinEffect,
    useRef,
    useState,
} from 'react';

const noop = () => {};

const ENUMS = {
    STATUS: {
        ERROR: 'ERROR',
        SUBMITTING: 'SUBMITTING',
        READY: 'READY',
        VALIDATING: 'VALIDATING',
    },
};

const useLayoutEffect =
    typeof window !== 'undefined' ? useWinEffect : useEffect;

const isBoolean = val =>
    typeof val === 'boolean' ||
    String(val).toLowerCase() === 'true' ||
    String(val).toLowerCase() === 'false';

const isBusy = status => {
    const statuses = [ENUMS.STATUS.SUBMITTING, ENUMS.STATUS.VALIDATING];
    return statuses.includes(String(status).toUpperCase());
};

const transformValue = val => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (!isNaN(val)) return Number(val);
    return val;
};

class FormEvent extends CustomEvent {
    constructor(type, data) {
        super(type, data);

        Object.entries(data).forEach(([key, value]) => {
            if (!this[key]) {
                this[key] = value;
            } else {
                key = `__${key}`;
                this[nkey] = value;
            }
        });
    }

    get detail() {
        return op.get(this, '__detail');
    }

    set detail(value) {
        op.set(this, '__detail', value);
    }

    get element() {
        return op.get(this, '__element');
    }

    set element(value) {
        op.set(this, '__element', value);
    }

    get element() {
        return op.get(this, '__element');
    }

    set element(value) {
        op.set(this, '__element', value);
    }

    get target() {
        return op.get(this, '__target');
    }

    set target(value) {
        op.set(this, '__target', value);
    }

    get value() {
        return op.get(this, '__value');
    }

    set value(value) {
        op.set(this, '__value', value);
    }
}

let EventForm = (initialProps, ref) => {
    // -------------------------------------------------------------------------
    // Refs
    // -------------------------------------------------------------------------
    const formRef = useRef();
    const temp = useRef({
        id: uuid(),
        watch: {},
    });

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const {
        children,
        className,
        controlled,
        defaultValue,
        namespace,
        onChange,
        onError,
        onSubmit,
        required,
        throttleChanges: throttle,
        validator,
        value: initialValue,
        ...props
    } = initialProps;

    const [state, setNewState] = useDerivedState({
        count: 0,
        error: null,
        status: ENUMS.STATUS.READY,
        ready: false,
        throttleChanges: throttle,
    });

    const valueRef = useRef(initialValue || defaultValue || {});
    const value = valueRef.current;
    const setNewValue = newValue => {
        if (unMounted()) return;
        newValue = newValue === null ? {} : newValue;

        // cleanup value ref
        Object.keys(valueRef.current).forEach(key => {
            if (!newValue || !(key in newValue)) op.del(valueRef.current, key);
        });

        Object.entries(newValue).forEach(([key, val]) =>
            op.set(valueRef.current, key, val),
        );
    };

    const isToggle = type => ['checkbox', 'radio'].includes(type);

    // applyValue called in number of useEffects
    // can async override call on form.setValue(null)
    // interpret clear, null, or {} as a clear
    const isClearSignal = (newValue, clear = false) =>
        clear === true ||
        newValue === null ||
        (typeof newValue === 'object' && Object.keys(newValue).length === 0);

    // -------------------------------------------------------------------------
    // Functions
    // -------------------------------------------------------------------------
    const applyValue = async (newValue, clear = false) => {
        // double-check for clear signal because of useEffects
        clear = isClearSignal(newValue, clear);

        if (unMounted()) return;
        if (controlled === true || typeof newValue === 'undefined') return;
        const elements = getElements();

        if (clear) {
            clearForm(elements);
            newValue = null;
        } else {
            newValue = { ...value, ...newValue };
        }

        Object.entries(elements).forEach(([name, element]) => {
            let val = op.get(newValue, name);

            if (Array.isArray(element)) {
                element.forEach((elm, i) => {
                    const type = elm.type;
                    if (isToggle(type)) {
                        // checkbox & radio
                        elm.checked = _.flatten([val]).includes(elm.value);
                    } else {
                        elm.value = op.get(val, i, elm.defaultValue);
                    }
                });
            } else {
                const type = element.type;
                if (element.value === val) return;

                if (isToggle(type)) {
                    // checkbox & radio
                    if (!val) {
                        element.checked = element.defaultChecked;
                        return;
                    }

                    element.checked = isBoolean(val)
                        ? Boolean(val)
                        : val === element.value;

                    return;
                }

                if (type === 'select-multiple') {
                    const options = Object.keys(element.options)
                        .filter(key => !isNaN(key))
                        .map(i => element.options[i]);

                    options.forEach(option => {
                        const v = !isNaN(option.value)
                            ? Number(option.value)
                            : option.value;
                        option.selected = _.flatten([val]).includes(v);
                    });

                    return;
                }

                val = val || element.defaultValue;
                element.value = val ? val : null;
            }
        });
    };

    const clearForm = elements => {
        elements = elements || getElements();
        Object.entries(elements).forEach(([name, element]) =>
            _.flatten([element]).forEach(elm => {
                if (!elm.type) return;

                const type = elm.type;

                if (isToggle(type)) {
                    elm.checked = false;
                    return;
                }

                if (type === 'select-multiple') {
                    const ids = Object.keys(elm.options).filter(
                        key => !isNaN(key),
                    );
                    const options = ids.map(i => elm.options[i]);
                    options.forEach(option => (option.selected = false));
                    return;
                }

                elm.value = null;
            }),
        );
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const childWatch = () => {
        if (unMounted()) return;

        const elms = getElements();
        const count = Object.keys(elms).length;

        if (count !== state.count) {
            setCount(count);

            const evt = new FormEvent('element-change', {
                target: formRef.current,
                element: op.get(event, 'target', formRef.current),
                value,
                elements: elms,
            });

            handle.dispatchEvent(evt);
        }
    };

    const _dispatchChange = (args = {}) => {
        if (unMounted()) return;

        let event = op.get(args, 'event', {});
        let newValue = op.get(args, 'value', getValue());
        newValue = newValue || getValue();

        const evt = new FormEvent('change', {
            target: formRef.current,
            element: op.get(event, 'target', formRef.current),
            value: newValue,
        });

        if (controlled !== true) setNewValue(newValue);

        handle.dispatchEvent(evt);
        onChange(evt);
    };

    const dispatchChange = _.throttle(_dispatchChange, state.throttleChanges, {
        leading: false,
    });

    const focus = name => {
        if (unMounted()) return;

        const elements = getElements();
        const element = op.get(elements, name);
        if (element) element.focus();
    };

    const getElements = () => {
        if (unMounted()) return {};

        const elements = formRef.current.elements;

        let elms = [];
        for (const element of elements) {
            if (element.type) {
                const name = element.name || element.getAttribute('name');
                if (name) elms.push({ name, element });
            }
        }

        elms = _.groupBy(elms, 'name');
        Object.entries(elms).forEach(([key, val]) => {
            val = _.pluck(val, 'element');
            elms[key] = val.length > 1 ? val : val[0];
        });

        return elms;
    };

    const getValue = k => {
        if (unMounted()) return {};

        const form = formRef.current;
        const elements = getElements(form);
        const keys = Object.keys(elements);
        const formData = new FormData(form);

        for (const key of formData.keys()) {
            keys.push(key);
        }

        const currentValue = keys.reduce((obj, key) => {
            let v = _.compact(_.uniq(formData.getAll(key))) || [];

            v = v.length === 1 && v.length !== 0 ? v[0] : v;
            v = v.length === 0 ? null : v;
            if (v !== null) {
                v = transformValue(v);
            }

            op.set(obj, key, v);

            return obj;
        }, {});

        if (k) {
            return op.get(currentValue, k);
        } else {
            return currentValue;
        }
    };

    const isEmpty = () => {
        let empty = true;

        Object.values(value).forEach(val => {
            if (_.isObject(val)) return;
            if (!_.isEmpty(val)) empty = false;
        });

        return empty;
    };

    const setCount = count => {
        setState({ count });
    };

    const setHandle = newHandle => {
        if (unMounted()) return;
        setNewHandle(newHandle);
    };

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const setValue = newValue => {
        if (unMounted()) return;

        const clear = isClearSignal(newValue);
        setNewValue(newValue);
        applyValue(newValue, clear);
        dispatchChange({
            value: clear ? {} : newValue,
            event: formRef.current,
        });
    };

    const unMounted = () => !formRef.current;

    const validate = async currentValue => {
        if (unMounted()) return;

        currentValue = currentValue || getValue();

        let context = {
            error: {},
            valid: true,
            value: currentValue,
        };

        const missing = required.filter(k =>
            _.isEmpty(op.get(currentValue, k)),
        );
        const elements = getElements();

        if (missing.length > 0) {
            context.valid = false;
            missing.forEach(field => {
                context.error[field] = {
                    field,
                    focus: elements[field],
                    message: `${field} is a required field`,
                };
            });
        }

        // Validators should return :
        // Object: {
        //      valid:Boolean,
        //      error: [Object, {
        //        field:String,
        //        focus:Element,
        //        message:String,
        //        value:Mixed
        //      }],
        //  }
        if (validator) context = await validator(context);
        return context;
    };

    // -------------------------------------------------------------------------
    // Event Handlers
    // -------------------------------------------------------------------------
    const _onChange = e => {
        if (!e.target.name) return;
        if (unMounted()) return;
        e.stopPropagation();
        //applyValue();
        dispatchChange();
    };

    const _onSubmit = async e => {
        if (unMounted()) return;

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let evt;
        const { status } = state;
        if (isBusy(status)) return;

        // validate
        setState({ error: null, status: ENUMS.STATUS.VALIDATING });

        const _value = getValue();

        const { valid, error } = await validate(_value);

        if (valid !== true || Object.keys(error).length > 0) {
            setState({ error, status: ENUMS.STATUS.ERROR });

            evt = new FormEvent('error', {
                element: formRef.current,
                error,
                target: handle,
                value: _value,
            });

            handle.dispatchEvent(evt);
            try {
                await onError(evt);
            } catch (err) {}

            setState({ status: ENUMS.STATUS.READY });
            return;
        }

        setState({ status: ENUMS.STATUS.SUBMITTING });

        evt = new FormEvent('submit', {
            element: formRef.current,
            target: handle,
            value: _value,
        });

        handle.dispatchEvent(evt);
        _.defer(() => setState({ status: ENUMS.STATUS.READY }));

        if (typeof onSubmit === 'function') {
            try {
                await onSubmit(evt);
            } catch (err) {}
        }
    };

    // -------------------------------------------------------------------------
    // Handle
    // -------------------------------------------------------------------------
    const _handle = () => ({
        ENUMS,
        defaultValue,
        elements: getElements(),
        error: op.get(state, 'error'),
        focus,
        form: formRef.current,
        getValue,
        props: initialProps,
        state,
        setCount,
        setState,
        setValue,
        submit: _onSubmit,
        unMounted,
        validate,
        value: getValue(),
    });

    const [handle, setNewHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    // -------------------------------------------------------------------------
    // Side effects
    // -------------------------------------------------------------------------

    // Apply value
    useLayoutEffect(() => {
        if (!isEmpty() && state.ready !== true) {
            setState({ ready: true });
        }
    });

    useEffect(() => {
        if (state.ready === true && state.count > 0)
            applyValue(valueRef.current);
    }, [state.count]);

    // Update handle on change
    useEffect(() => {
        const newHandle = { ...handle };
        op.set(newHandle, 'value', getValue());
        op.set(newHandle, 'elements', getElements());
        op.set(newHandle, 'error', op.get(state, 'error'));
        op.set(newHandle, 'form', formRef.current);
        setHandle(newHandle);
    }, [formRef.current, state.count, state.errors, Object.values(value)]);

    // update value from props
    useEffect(() => {
        // ignore when would result in no change or when undefined
        if (initialValue === undefined || _.isEqual(value, initialValue))
            return;

        setValue(initialValue);
        dispatchChange({ value: initialValue });
    }, [initialValue]);

    // status
    useEffect(() => {
        if (unMounted()) return;

        handle.dispatchEvent(
            new FormEvent('status', {
                detail: op.get(state, 'status'),
                element: formRef.current,
                target: handle,
                value,
            }),
        );
    }, [state.status]);

    // change flush
    useEffect(() => {
        if (op.get(temp.current, 'watch.children')) {
            clearInterval(temp.current.watch.children);
        }

        temp.current['watch'] = {
            children: setInterval(() => childWatch(), 1),
        };

        return () => {
            Object.keys(temp.current.watch).forEach(clearInterval);
        };
    });

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <form
            {...props}
            className={cn(className, cx())}
            onChange={_onChange}
            onSubmit={_onSubmit}
            ref={formRef}>
            {children}
        </form>
    );
};

EventForm = forwardRef(EventForm);

EventForm.ENUMS = ENUMS;

EventForm.Event = FormEvent;

EventForm.propTypes = {
    className: PropTypes.string,
    controlled: PropTypes.bool,
    defaultValue: PropTypes.object,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required: PropTypes.array.isRequired,
    name: PropTypes.string,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    onSubmit: PropTypes.func,
    throttleChanges: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    value: PropTypes.object,
    validator: PropTypes.func,
};

EventForm.defaultProps = {
    controlled: false,
    defaultValue: {},
    id: uuid(),
    name: 'form',
    namespace: 'ar-event-form',
    onChange: noop,
    onError: noop,
    throttleChanges: 1500,
    required: [],
    value: undefined,
};

export { EventForm, EventForm as default, FormEvent };
