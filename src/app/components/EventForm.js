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

export class FormEvent extends CustomEvent {
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
    const temp = useRef({ changes: [], id: uuid(), focus: null });

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
        validator,
        value: initialValue,
        ...props
    } = initialProps;

    const [state, setNewState] = useDerivedState({
        count: 0,
        error: null,
        status: ENUMS.STATUS.READY,
        ready: false,
    });

    const [value, setNewValue] = useState(initialValue || defaultValue || {});

    // -------------------------------------------------------------------------
    // Functions
    // -------------------------------------------------------------------------
    const applyValue = async (newValue, clear = false) => {
        if (unMounted()) return;
        if (controlled === true || typeof newValue === 'undefined') return;

        newValue = clear === true ? newValue : { ...value, ...newValue };

        const { focus } = temp.current;

        const elements = _.flatten(
            Object.values(getElements()).map(element => {
                if (Array.isArray(element)) {
                    return element;
                } else {
                    return [element];
                }
            }),
        );

        if (clear === true) {
            Object.entries(elements).forEach(([, element]) => {
                if (!element.name) return;
                if (!element.type) return;

                const type = element.type;

                if (['checkbox', 'radio'].includes(type)) {
                    element.checked = false;
                    return;
                }

                if (type === 'select-multiple') {
                    const ids = Object.keys(element.options).filter(
                        key => !isNaN(key),
                    );
                    const options = ids.map(i => element.options[i]);
                    options.forEach(option => (option.selected = false));
                    return;
                }

                element.value = null;
            });
        }

        Object.entries(elements).forEach(([, element]) => {
            if (!element.name) return;
            if (!element.type) return;
            if (focus === element) return;

            const name = element.name;
            const type = element.type;
            const defaultValue = op.get(element, 'defaultValue');
            const val = op.get(newValue, name) || defaultValue;

            if (Array.isArray(val)) {
                // Checkbox & Radio
                if (['checkbox', 'radio'].includes(type)) {
                    if (isBoolean(val)) {
                        element.checked = !!val;
                    } else {
                        const v = !isNaN(element.value)
                            ? Number(element.value)
                            : element.value;
                        element.checked = val.includes(v);
                    }
                }

                // Select: Multiple
                if (type === 'select-multiple') {
                    const ids = Object.keys(element.options).filter(
                        key => !isNaN(key),
                    );
                    const options = ids.map(i => element.options[i]);

                    options.forEach(option => {
                        const v = !isNaN(option.value)
                            ? Number(option.value)
                            : option.value;
                        option.selected = val.includes(v);
                    });
                }
            } else {
                if (element.value === val) return;
                if (val) element.value = val;

                if (isBoolean(val)) {
                    element.value = true;
                    element.checked = Boolean(val);
                }
            }
        });

        const evt = new FormEvent('apply-values', {
            target: formRef.current,
            value: newValue,
        });

        handle.dispatchEvent(evt);
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

    const dispatchChange = ({ value: newValue, event = {} }) => {
        if (unMounted()) return;

        newValue = newValue || getValue();

        if (controlled !== true) {
            setNewValue(newValue);
        }

        const evt = new FormEvent('change', {
            target: formRef.current,
            element: op.get(event, 'target', formRef.current),
            value: newValue,
        });

        handle.dispatchEvent(evt);
        onChange(evt);
    };

    const flush = () => {
        if (unMounted()) return;
        if (temp.current.changes.length < 1) return;

        // squash changes
        let event = {};
        let newValue = {};

        temp.current.changes.forEach(item => {
            const { target, value } = item;

            op.set(event, 'target', target);

            Object.entries(value).forEach(([key, val]) => {
                op.set(newValue, key, val);
            });
        });

        dispatchChange({ value: newValue, event });
        temp.current.changes = [];
        temp.current.focus = null;
    };

    const focus = name => {
        if (unMounted()) return;

        const elements = getElements();
        const element = op.get(elements, name);
        if (element) element.focus();
    };

    const getElements = () => {
        if (unMounted()) return {};

        const form = formRef.current;
        const elements = form.elements;
        const ids = Object.keys(elements).filter(key => !isNaN(key));

        const elms = ids.reduce((obj, i) => {
            const element = elements[i];
            const name = element.getAttribute('name');

            if (!name) return obj;

            if (op.has(obj, name)) {
                if (!Array.isArray(obj[name])) {
                    obj[name] = [obj[name]];
                }
                obj[name].push(element);
            } else {
                obj[name] = element;
            }

            return obj;
        }, {});

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

    const queue = (value, target) => {
        if (!op.get(temp, 'current.changes')) temp.current.changes = [];
        temp.current.changes.push({ target, value });
        temp.current.focus = target;
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
        if (newValue === null) applyValue(newValue, true);
        dispatchChange({ value: newValue, event: formRef.current });
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
        if (unMounted()) return;
        if (e.target && !e.target.name) return;

        e.stopPropagation();
        queue(getValue(), e.target);
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
        const { valid, error } = await validate(value);

        if (valid !== true || Object.keys(error).length > 0) {
            setState({ error, status: ENUMS.STATUS.ERROR });

            evt = new FormEvent('error', {
                element: formRef.current,
                error,
                target: handle,
                value,
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
            value,
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
        if (state.ready === true) applyValue(value, true);
    }, [state.count]);

    // Update handle on change
    useEffect(() => {
        setHandle(_handle());
    }, [formRef.current, state.count, state.errors, value]);

    // update value from props
    useEffect(() => {
        if (_.isEqual(value, initialValue)) return;
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
        if (isEmpty()) return;

        const { id } = temp.current;
        Reactium.Pulse.register(`eventform-flush-${id}`, () => flush(), {
            delay: 1000,
            repeate: -1,
        });
        Reactium.Pulse.register(
            `eventform-children-${id}`,
            () => childWatch(),
            { delay: 1, repeat: -1 },
        );
        return () => {
            Reactium.Pulse.unregister(`eventform-flush-${id}`);
            Reactium.Pulse.unregister(`eventform-children-${id}`);
        };
    });

    // initial value change
    useEffect(() => {
        if (!_.isEqual(value, initialValue)) applyValue(initialValue);
    }, [Object.values(initialValue)]);

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
    required: [],
    value: {},
};

export { EventForm, EventForm as default };

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
