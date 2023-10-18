import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';

import Reactium, {
    useDispatcher,
    useEventEffect,
    useHookComponent,
    useRefs,
    useStatus,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';

const filteredProps = (props) =>
    Object.entries(props).reduce((obj, [key, val]) => {
        if (!String(key).startsWith('on')) {
            obj[key] = val;
        }

        return obj;
    }, {});

const inputTypes = [
    'input',
    'textarea',
    'select',
    'select-one',
    'checkbox',
    'color',
    'date',
    'datetime-local',
    'email',
    'file',
    'hidden',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'search',
    'tel',
    'text',
    'time',
    'url',
    'week',
    'meter',
    'progress',
];

/**
 * -----------------------------------------------------------------------------
 * Context FormContext
 * -----------------------------------------------------------------------------
 */

const defaultContext = [
    'addEventListener',
    'childClone',
    'complete',
    'dispatch',
    'get',
    'elements',
    'error',
    'isStatus',
    'removeEventListener',
    'register',
    'reset',
    'set',
    'asyncValidator',
    'setStatus',
    'setValue',
    'submit',
    'unregister',
    'validate',
].reduce(
    (obj, method) => {
        obj[method] = _.noop;
        return obj;
    },
    {
        props: {},
        empty: true,
        refs: { get: _.noop, set: _.noop },
        status: 'pending',
        value: {},
        childrenMap: (children) => children,
    },
);

const FormContext = React.createContext(defaultContext);
FormContext.displayName = 'FormContext';

const FormError = ({ children, name, ...props }) => {
    const { FormContext } = useHookComponent('ReactiumUI');
    const Form = React.useContext(FormContext);

    const [error, setError] = useState(Form.error(name));

    const _onError = () => {
        setError(Form.error(name));
    };

    const _onErrorClear = ({ detail }) => {
        const { fieldName } = detail;
        if (fieldName === name) setError(null);
    };

    const clear = () => setError(null);

    useEventEffect(Form, {
        reset: clear,
        error: _onError,
        'before-submit': clear,
        'clear-error': _onErrorClear,
    });

    return error ? <div {...props} children={children || error} /> : null;
};

FormError.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    name: PropTypes.string.isRequired,
};

FormError.defaultProps = {
    className: 'error-message',
};

const FormRegister = ({ children }) => {
    const { FormContext } = useHookComponent('ReactiumUI');
    const Form = React.useContext(FormContext);
    return Form.childrenMap(children);
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Form
 * -----------------------------------------------------------------------------
 */
let Form = (
    {
        className,
        children,
        defaultValue,
        id = uuid(),
        namespace,
        style,
        value: initialValue,
        ...props
    },
    ref,
) => {
    if (initialValue && defaultValue) {
        throw new Error(
            'Form component cannot supply both `defaultValue` and `value` properties',
        );
    }

    if (initialValue && !op.get(props, 'onChange')) {
        throw new Error(
            'Form component must supply `onChange` prop when specifying `value` prop',
        );
    }

    const [status, setStatus, isStatus] = useStatus(Form.STATUS.INIT);

    const refs = useRefs({ elements: {}, id });

    const initVal = _.chain([initialValue, defaultValue])
        .compact()
        .first()
        .value();

    const state = useSyncState({
        errors: null,
        id: refs.get('id'),
        asyncValidators: [],
        value: initVal,
        resetValue: initVal,
    });

    state.value = state.get('value');

    const inputs = useMemo(() => {
        let arr = _.clone(inputTypes);
        Reactium.Hook.runSync('form-input-types', arr);
        Reactium.Hook.runSync(`form-input-types-${refs.get('id')}`, arr);
        return arr;
    }, []);

    const applyValues = useCallback((values) => {
        state.value = values;

        const fields = getElements();

        if (Object.keys(values).length > 0 && fields.length < 1) {
            return _.defer(() => applyValues(values));
        }

        fields.forEach((item) => {
            if (!item.ref || item.typeahead) return;

            if (!error(item.key)) {
                item.ref.removeAttribute('aria-invalid');
            }

            let val = op.get(values, item.key);
            val = val === 'true' ? true : val;

            switch (item.type) {
                case 'radio':
                case 'checkbox':
                    val = !val ? false : val;

                    let ival = item.ref.value || true;

                    ival = ival === 'true' ? true : ival;
                    ival = !ival && ival !== 0 ? false : ival;

                    item.ref.checked = String(val) === String(ival);
                    break;

                case 'date':
                case 'week':
                case 'time':
                case 'range':
                case 'month':
                case 'number':
                case 'datetime-local':
                    item.value = val;
                    item.ref.value =
                        typeof val === 'undefined' ? item.ref.min || '0' : val;
                    break;

                default:
                    item.value = val;
                    item.ref.value = typeof val !== 'undefined' ? val : '';
            }
        });

        return state;
    }, []);

    const childClone = useCallback((child) => {
        if (!child) return null;
        if (!child.type) return child;
        if (_.isString(child)) return child;
        if (_.isNumber(child)) return child;
        if (_.isFunction(child)) return child;

        if (inputs.includes(child.type) && child.props.name) {
            const name = String(child.props.name);
            const narr = name.split('.');
            const refkey = `elements.${name}`;

            if (isStatus(Form.STATUS.INIT)) {
                const val = isControlled()
                    ? child.props.value
                    : child.props.defaultValue;
                state.set(['value', name], val, false);
            }

            if (narr.length > 1) {
                narr.pop();
                refs.set(`elements.${narr.join('.')}`, {});
            }

            const cloned = React.cloneElement(
                child,
                {
                    'aria-required': op.get(
                        child.props,
                        'aria-required',
                        op.get(child.props, 'required'),
                    ),
                    required: undefined,
                    ref: (elm) => {
                        if (!elm) return;

                        refs.set(refkey, elm);

                        if (child.ref) {
                            if (_.isFunction(child.ref)) {
                                child.ref(elm);
                            } else if (_.isObject(child.ref)) {
                                child.ref.current = elm;
                            }
                        }
                    },
                    onChange: (e) => _onInputChange(e, child.props.onChange),
                    defaultValue: isControlled()
                        ? undefined
                        : !child.props.value
                        ? child.props.defaultValue
                        : undefined,
                    value: isControlled()
                        ? undefined
                        : child.props.value || undefined,
                },
                childrenMap(child.props.children),
            );

            dispatch('register', { element: cloned });

            return cloned;
        }

        return React.cloneElement(
            child,
            null,
            childrenMap(child.props.children),
        );
    }, []);

    const childrenMap = useCallback(
        (carr) => React.Children.map(carr, childClone),
        [],
    );

    const complete = useCallback((results) => {
        _onComplete(results);
        return state;
    }, []);

    const _dispatch = useDispatcher({ props, state });

    const dispatch = (...args) => {
        _dispatch(...args);
        return state;
    };

    const error = useCallback((key) => {
        const errors = state.get('errors', {}) || {};
        return key ? errors[key] : errors;
    }, []);

    const formatValue = useCallback((key, value) => {
        const obj = { [key]: value };
        Reactium.Hook.runSync('form-input-value', obj);
        Reactium.Hook.runSync(`form-input-value-${refs.get('id')}`, obj);
        return obj[key];
    }, []);

    const getElements = () => {
        const keys = [];

        const elms = _.compact(
            Array.from(Object.entries(refs.get('elements'))),
        );

        while (elms.length > 0) {
            const [key, elm] = elms.shift();
            if (!elm) continue;

            let tag;

            try {
                tag = elm.tagName ? elm.tagName.toLowerCase() : null;
            } catch (err) {}

            if (tag) {
                keys.push(key);
            } else {
                Object.keys(elm).forEach((k) =>
                    elms.push([`${key}.${k}`, elm[k]]),
                );
            }
        }

        const values = state.get('value');

        const output = keys.reduce((arr, key) => {
            const ref = refs.get(`elements.${key}`);
            if (!ref) return arr;

            const tag = ref.tagName.toLowerCase();

            const type = ref.type;

            let val = op.get(values, key);

            let checked;
            if (type === 'checkbox' || type === 'radio') {
                checked = ref.checked;
            }

            const typeahead = !!ref.closest('.typeahead');

            arr.push({ key, ref, tag, type, value: val, checked, typeahead });
            return arr;
        }, []);

        return output;
    };

    const getFormValues = useCallback(() => {
        if (!refs.get('form')) return {};

        const formData = new FormData(refs.get('form'));
        const formValue = Object.fromEntries(formData.entries());

        const output = Object.entries(formValue).reduce((obj, [key, value]) => {
            let v = formatValue(key, value);

            if (!_.isEmpty(v) || v === 0) {
                op.set(obj, key, v);
            }

            return obj;
        }, {});

        return output;
    }, []);

    const getValueKeys = (v) => {
        const keys = Object.keys(v);
        const karr = [];
        while (keys.length > 0) {
            const key = keys.shift();
            const val = op.get(v, key);

            if (_.isArray(val)) {
                karr.push(key);
            } else {
                if (_.isObject(val)) {
                    Object.keys(val).forEach((k) => karr.push(`${key}.${k}`));
                } else {
                    karr.push(key);
                }
            }
        }

        return karr;
    };

    const isControlled = useCallback(
        () => Boolean(initialValue && op.has(props, 'onChange')),
        [],
    );

    const register = useCallback((elm) => {
        if (!elm) return;
        if (!elm.name) return;

        let elements = refs.get('elements');
        op.ensureExists(elements, elm.name);

        op.set(elements, elm.name, elm);

        refs.set('elements', elements);
        return state;
    }, []);

    const reset = useCallback(() => {
        const values = state.get('resetValue', {});

        setError();

        applyValues(values);

        dispatch('reset');

        _onChange();

        setStatus(Form.STATUS.READY);

        return state;
    }, []);

    const runAsyncValidator = useCallback((prom) => {
        const validators = state.get('asyncValidators', []);
        validators.push(prom);
        state.set('asyncValidators', validators);
        return prom;
    }, []);

    const setError = useCallback((key, message, emit = false) => {
        const elms = getElements();

        if (!key || !message) {
            state.set('errors', null, false);
            elms.forEach((item) => item.ref.removeAttribute('aria-invalid'));
        } else {
            const errors = error();
            op.set(errors, key, message);
            state.set('errors', errors, emit);
        }

        return state;
    }, []);

    const clearError = (fieldName) => {
        if (!fieldName) {
            return setError();
        } else {
            const errors = state.get('errors') || {};

            op.del(errors, fieldName);

            state.set('errors', null, false);

            state.set('errors', errors);

            dispatch('clear-error', { detail: { fieldName } });

            return state;
        }
    };

    const setValue = useCallback((key, value = null) => {
        if (!key || (_.isObject(key) && Object.keys(key).length < 1)) {
            state.set('value', null, false);
            state.set('value', {}, false);
        } else {
            if (_.isObject(key)) {
                state.set('value', key, false);
            } else {
                state.set(`value.${key}`, value, false);
            }
        }

        applyValues(state.get('value'));

        return state;
    }, []);

    const submit = useCallback(async () => {
        if (isStatus(Form.STATUS.PROCESSING)) return state;

        const value = { ...state.value };

        getValueKeys(value).forEach((k) => {
            const v = op.get(value, k);
            const val = _.isArray(v) ? _.compact(v) : v;
            op.set(value, k, val);
        });

        dispatch('before-submit', { value });

        const isValid = await validate(value);

        if (isValid !== true) {
            setStatus(Form.STATUS.INVALID, true);
            return state;
        }

        setStatus(Form.STATUS.READY, true);

        dispatch('submit', { value });

        return state;
    }, []);

    const unregister = useCallback((name) => {
        refs.set(`elements.${name}`, null);
        return state;
    }, []);

    const validate = useCallback(async (values) => {
        state.set('asyncValidators', [], false);

        const elms = getElements();

        // clear errors
        setError();

        const reqs = elms.filter((item) => {
            return item.ref.getAttribute('aria-required') === 'true';
        });

        reqs.forEach((item) => {
            if (!op.get(values, item.key)) {
                const message =
                    item.ref.getAttribute('aria-errormessage') ||
                    `${item.key} is a required field`;

                setError(item.key, message);
            }
        });

        let errors = error();

        dispatch('validate', { errors, values });

        const asyncValidators = state.get('asyncValidators', []);
        await Promise.all(asyncValidators);

        state.set('asyncValidators', [], false);

        errors = error();

        return Object.keys(errors).length < 1 || errors;
    }, []);

    const _onChange = useCallback((e) => {
        if (e && e.target) {
            const field = e.target.name;
            if (!field) return;

            const checks = ['checkbox', 'radio'];
            const type = e.target.getAttribute('type');
            const isCheckable = type ? checks.includes(type) : false;

            let value = isCheckable
                ? e.target.checked
                    ? e.target.value || true
                    : null
                : e.target.value;

            value = value === 'true' ? true : value;

            const previous = op.get(state.get('value'), field);
            const changed = { field, value, previous };

            if (isControlled()) {
                setValue(initialValue);
            } else {
                setValue(field, value);
            }

            if (op.get(previous, changed.field) !== changed.value) {
                dispatch('change', { detail: { changed } });
            }
        } else {
            setValue(getFormValues());
        }
    }, []);

    const _dispatchChanges = (prev = {}, curr = {}) =>
        _.chain([Object.keys(prev), Object.keys(curr)])
            .flatten()
            .uniq()
            .value()
            .forEach((field) => {
                const p = op.get(prev, field);
                const c = op.get(curr, field);

                if (p !== c) {
                    const changed = { field, previous: p, value: c };
                    dispatch('change', { detail: { changed } });
                }
            });

    const _onComplete = useCallback((results) => {
        setStatus('complete', true);
        dispatch(Form.STATUS.COMPLETE, { results });
    }, []);

    const _onInputChange = useCallback((e, callback) => {
        if (_.isFunction(callback)) {
            callback(e);
        }

        if (e.defaultPrevented) return;

        const name = e.target.name;
        const current = state.get(['value', name]);

        if (current !== e.target.value) {
            dispatch('input', { element: e.target, detail: e });
        }
    }, []);

    const _onError = useCallback(() => {
        if (Object.keys(error()).length < 1) return;

        const elms = getElements();

        const earr = [];

        elms.forEach((item) => {
            if (error(item.key)) {
                item.ref.setAttribute('aria-invalid', 'true');
                earr.push(item.ref);
            } else {
                item.ref.removeAttribute('aria-invalid');
            }
        });

        dispatch('error', { errors: error(), elements: earr });

        setStatus('ready', true);
    }, []);

    const _onReset = useCallback(() => {
        reset();
    }, []);

    const _onSubmit = useCallback((e) => {
        e.preventDefault();
        submit();
    }, []);

    const _setError = (key, message, emit = true) =>
        setError(key, message, emit);

    const _setStatus = (...args) => {
        setStatus(...args);
        return state;
    };

    const _setValue = (...args) => {
        if (isControlled()) {
            console.warn(
                'Form.setValue() can only be called on an uncontrolled form',
            );
            return;
        }

        const previous = { ...state.value };

        setValue(...args);
        state.set('update', Date.now());

        _dispatchChanges(previous, state.get('value', {}));

        return state;
    };

    // External interface
    state.refs = refs;
    state.props = props;
    state.status = status;
    state.controlled = isControlled();

    state.extend('childrenMap', childrenMap);
    state.extend('childClone', childClone);
    state.extend('clearError', clearError);
    state.extend('complete', complete);
    state.extend('dispatch', dispatch);
    state.extend('elements', getElements);
    state.extend('error', error);
    state.extend('isStatus', isStatus);
    state.extend('register', register);
    state.extend('reset', reset);
    state.extend('submit', submit);
    state.extend('runAsyncValidator', runAsyncValidator);
    state.extend('setError', _setError);
    state.extend('setStatus', _setStatus);
    state.extend('setValue', _setValue);
    state.extend('unregister', unregister);
    state.extend('validate', validate);

    useImperativeHandle(ref, () => state);

    /**
     * -------------------------------------------------------
     * Side Effects
     * -------------------------------------------------------
     */

    // 1.0
    useEffect(() => {
        if (!initVal) return;
        state.set('resetValue', initVal, true);
        setValue(_.isObject(initVal) ? initVal : {});
    }, [initVal]);

    // 2.0
    useEffect(() => {
        applyValues(state.get('value', {}));
        state.set('update', Date.now());
    }, [state.get('value')]);

    // 3.0
    useEffect(() => {
        state.status = status;
        dispatch('status', { status });

        if (isStatus(Form.STATUS.COMPLETE)) setStatus('ready');

        state.set('update', Date.now());
    }, [status]);

    // 4.0
    useEffect(_onError, [state.get('errors')]);

    // 5.0
    useEffect(() => {
        if (!isStatus('init')) return;
        if (!refs.get('form')) return;
        setValue(getFormValues());
        setStatus(Form.STATUS.READY, true);
    });

    // 6.0

    // Render
    return (
        <form
            noValidate
            style={style}
            id={refs.get('id')}
            onReset={_onReset}
            onChange={_onChange}
            onSubmit={_onSubmit}
            className={cn(namespace, className)}
            {...filteredProps(props)}
            ref={(elm) => refs.set('form', elm)}
        >
            <FormContext.Provider value={state}>
                {childrenMap(children)}
            </FormContext.Provider>
        </form>
    );
};

Form = forwardRef(Form);

Form.propTypes = {
    className: PropTypes.string,
    defaultValue: PropTypes.object,
    id: PropTypes.string,
    namespace: PropTypes.string,
    onChange: PropTypes.func,
    onComplete: PropTypes.func,
    onError: PropTypes.func,
    onRegister: PropTypes.func,
    onSubmit: PropTypes.func,
    onValidate: PropTypes.func,
    style: PropTypes.object,
    value: PropTypes.object,
};

Form.defaultProps = {
    namespace: 'form-group',
    style: {},
};

Form.STATUS = {
    COMPLETE: 'complete',
    INVALID: 'invalid',
    INIT: 'init',
    PROCESSING: 'processing',
    READY: 'ready',
};

export { Form, FormContext, FormError, FormRegister };
