import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import Reactium, { useDerivedState, useEventHandle } from 'reactium-core/sdk';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useLayoutEffect as useWindowEffect,
    useMemo,
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
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

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
    /* Refs */
    const formRef = useRef();

    /* State */
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
        showError,
        validator,
        value: initialValue,
        ...props
    } = initialProps;

    const [state, setState] = useDerivedState({
        errors: null,
        status: ENUMS.STATUS.READY,
    });

    const [value, setNewValue] = useState(initialValue || defaultValue || {});

    useImperativeHandle(ref, () => handle);

    /* Functions */
    const applyValue = newValue => {
        if (controlled === true || typeof newValue === 'undefined') return;

        const value = newValue;
        const elements = _.flatten(
            Object.values(getElements()).map(element => {
                if (Array.isArray(element)) {
                    return element;
                } else {
                    return [element];
                }
            }),
        );

        Object.entries(elements).forEach(([, element]) => {
            const name = element.name;
            const type = element.type;
            const val = op.get(value, name, '');

            if (Array.isArray(val)) {
                // Checkbox & Radio
                if (['checkbox', 'radio'].includes(type)) {
                    const v = !isNaN(element.value)
                        ? Number(element.value)
                        : element.value;

                    if (isBoolean(val)) {
                        element.checked = val;
                    } else {
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
                element.value = val;

                if (isBoolean(val)) {
                    element.value = true;
                    element.checked = Boolean(val);
                }
            }
        });
    };

    // className prefixer
    const cx = cls =>
        _.chain([className || namespace, cls])
            .compact()
            .uniq()
            .value()
            .join('-');

    const dispatchChange = ({ value: newValue, event = {} }) => {
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

    const focus = name => {
        const elements = getElements();
        const element = op.get(elements, name);
        if (element) element.focus();
    };

    const getElements = () => {
        const form = formRef.current;
        if (!form) return {};

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
        const form = formRef.current;
        const elements = getElements(form);
        const keys = Object.keys(elements);
        const formData = new FormData(form);

        for (const key of formData.keys()) {
            keys.push(key);
        }

        const value = keys.reduce((obj, key) => {
            let v = _.compact(_.uniq(formData.getAll(key))) || [];

            v = v.length === 1 && v.length !== 0 ? v[0] : v;
            v = v.length === 0 ? null : v;

            op.set(obj, key, v);

            return obj;
        }, {});

        if (k) {
            return op.get(value, k);
        } else {
            return value;
        }
    };

    const setValue = newValue =>
        dispatchChange({ value: newValue, event: formRef.current });

    const validate = async value => {
        value = value || getValue();

        let valid = true;
        let errors = { focus: null, fields: [], errors: [] };

        const missing = required.filter(k => _.isEmpty(value[k]));

        if (missing.length > 0) {
            valid = false;
            missing.reduce((errors, field) => {
                errors.fields.push(field);
                errors.errors.push(`${field} is a required field`);

                return errors;
            }, errors);

            errors.focus = errors.fields.length > 0 ? errors.fields[0] : null;
        }

        if (validator) {
            const validatorResult = await validator(value, valid, errors);
            valid = op.get(validatorResult, 'valid', true) && valid;
            const newErrors = op.get(validatorResult, 'errors', {});
            errors = {
                focus: newErrors.focus || errors.focus,
                fields: _.unique([...errors.fields, ...newErrors.fields]),
                errors: _.unique([...errors.errors, ...newErrors.errors]),
            };
        }

        return { valid, errors };
    };

    /* Event handlers */
    const _onChange = e => {
        e.stopPropagation();
        dispatchChange({ event: e });
    };

    const _onSubmit = async e => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        let evt;
        const { status } = state;
        if (isBusy(status)) return;

        // validate
        setState({ errors: null, status: ENUMS.STATUS.VALIDATING });
        const { valid, errors } = await validate(value);

        if (valid !== true) {
            setState({ errors, status: ENUMS.STATUS.ERROR });

            evt = new FormEvent('error', {
                element: formRef.current,
                errors,
                target: handle,
                value,
            });

            handle.dispatchEvent(evt);
            onError(evt);
            return;
        }

        setState({ status: ENUMS.STATUS.SUBMITTING });

        evt = new FormEvent('submit', {
            element: formRef.current,
            target: handle,
            value,
        });

        handle.dispatchEvent(evt);

        if (typeof onSubmit === 'function') {
            await onSubmit(evt);
        }

        setState({ status: ENUMS.STATUS.READY });
    };

    /* Handle */
    const _handle = () => ({
        defaultValue,
        elements: getElements(),
        errors: op.get(state, 'errors'),
        focus,
        form: formRef.current,
        getValue,
        props: initialProps,
        state,
        setState,
        setValue,
        submit: _onSubmit,
        validate,
        value,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    /* Side effects */

    // Apply value
    useEffect(() => {
        applyValue(value);
    }, [value]);

    // Update handle on change
    useEffect(() => {
        setHandle(_handle());
    }, [value, op.get(state, 'errors'), formRef.current]);

    // update value from props
    useEffect(() => {
        if (_.isEqual(value, initialValue)) return;
        dispatchChange({ value: initialValue });
    }, [initialValue]);

    // status
    useEffect(() => {
        handle.dispatchEvent(
            new FormEvent('status', {
                detail: op.get(state, 'status'),
                element: formRef.current,
                target: handle,
                value,
            }),
        );
    }, [op.get(state, 'status')]);

    // Children change -> applyValue
    useLayoutEffect(() => {
        applyValue(value);
    }, [children]);

    /* Renderers */
    const render = () => {
        const { errors } = state;
        return (
            <form
                {...props}
                className={cx()}
                onChange={_onChange}
                onSubmit={_onSubmit}
                ref={formRef}>
                <Errors cx={cx} errors={errors} showError={showError} />
                {children}
            </form>
        );
    };

    return render();
};

EventForm = forwardRef(EventForm);

EventForm.propTypes = {
    className: PropTypes.string,
    controlled: PropTypes.bool,
    defaultValue: PropTypes.object,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    required: PropTypes.array.isRequired,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    onSubmit: PropTypes.func,
    showError: PropTypes.bool,
    value: PropTypes.object,
    validator: PropTypes.func,
};

EventForm.defaultProps = {
    controlled: false,
    id: uuid(),
    namespace: 'ar-event-form',
    onChange: noop,
    onError: noop,
    required: [],
    showError: false,
    validator: (value, valid = true, errors) => ({ valid, errors }),
};

export default EventForm;

const Errors = ({ errors, showError, cx }) => {
    return errors && showError ? (
        <ul className={cx('errors')}>
            {errors.errors.map(error => (
                <li className={cx('error-item')} key={error}>
                    {error}
                </li>
            ))}
        </ul>
    ) : null;
};

const isBoolean = val =>
    typeof val === 'boolean' ||
    String(val).toLowerCase() === 'true' ||
    String(val).toLowerCase() === 'false';

const isBusy = status => {
    const statuses = [ENUMS.STATUS.SUBMITTING, ENUMS.STATUS.VALIDATING];
    return statuses.includes(String(status).toUpperCase());
};
