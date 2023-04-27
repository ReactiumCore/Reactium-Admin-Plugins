import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import React, {
    forwardRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const noop = () => {};

const ENUMS = {
    DEPRECATED:
        'Reactium UI -> WebForm has been deprecated. You should use the EventForm component instead.',
    STATUS: {
        COMPLETE: 'COMPLETE',
        READY: 'READY',
        SENDING: 'SENDING',
        ERROR: 'ERROR',
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: WebForm
 * -----------------------------------------------------------------------------
 */
let warned = false;
let WebForm = (props, ref) => {
    const {
        className,
        namespace,
        required,
        onChange: onFormChange,
        onBeforeSubmit,
        onComplete,
        onError,
        onSubmit,
        onUpdate,
        showError,
        validator,
        value,
        valueUpdated,
        name,
        id,
        children,
        ...formProps
    } = props;

    // Refs
    const formRef = useRef();
    const stateRef = useRef({
        value,
        errors: null,
        mounted: false,
        status: ENUMS.STATUS.READY,
        elements: {},
    });

    // State
    const [, setNewState] = useState(new Date());

    // Internal Interface
    const setState = (newState, rerender = true) => {
        // Update the stateRef
        stateRef.current = {
            ...stateRef.current,
            ...newState,
        };

        // Trigger useEffect()
        if (rerender) setNewState(new Date());
    };

    const getElements = () => {
        const elements = formRef.current.elements;
        const ids = Object.keys(elements).filter(key => !isNaN(key));
        const formElements = ids.reduce((obj, i) => {
            const element = elements[i];
            const name = element.name;

            if (name) {
                if (op.has(obj, name)) {
                    if (!Array.isArray(obj[name])) {
                        obj[name] = [obj[name]];
                    }
                    obj[name].push(element);
                } else {
                    obj[name] = element;
                }
            }

            return obj;
        }, {});

        setState({
            elements: formElements,
        });
    };

    const applyValue = value => {
        value = value || stateRef.current.value;

        const elements = _.flatten(
            Object.values(stateRef.current.elements).map(element => {
                if (Array.isArray(element)) {
                    return element;
                } else {
                    return [element];
                }
            }),
        );

        const isBoolean = val =>
            typeof val === 'boolean' ||
            String(val).toLowerCase() === 'true' ||
            String(val).toLowerCase() === 'false';

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

        onUpdate({ value, elements });
    };

    const update = value => {
        value = value || stateRef.current.value;
        setState({ value });
        getElements();
        applyValue(value);
    };

    const focus = fieldName => {
        if (fieldName in stateRef.current.elements) {
            stateRef.current.elements[fieldName].focus();
        }
    };

    // Side Effects
    const errorFields = op.get(stateRef.current, 'errors.fields', []);

    useLayoutEffect(() => {
        const { mounted } = stateRef.current;
        if (mounted !== true) {
            op.set(stateRef.current, 'mounted', true);

            update(value);
            Object.entries(stateRef.current.elements).forEach(
                ([fieldName, field]) => {
                    if (errorFields.find(error => error === fieldName)) {
                        field.classList.add('error');
                    } else {
                        field.classList.remove('error');
                    }
                },
            );
        }
    }, [op.get(stateRef.current, 'mounted')]);

    useEffect(() => {
        const value = op.get(props, 'value');
        update(value);
    }, [valueUpdated]);

    const onChange = async e => {
        const value = getValue(null, true);
        if (onFormChange) {
            await onFormChange(e, value);
        }
        update(value);
    };

    const getValue = (k, rerender = false) => {
        const elements = stateRef.current.elements;
        const keys = Object.keys(elements);

        const formData = new FormData(formRef.current);
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

        setState({ value }, rerender);

        if (k) {
            return stateRef.current.value[k];
        }

        return stateRef.current.value;
    };

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
        }

        if (validator) {
            const validatorResult = await validator(value, valid, errors);
            valid = op.get(validatorResult, 'valid', true) && valid;
            const newErrors = op.get(validatorResult, 'errors', {});
            errors = {
                focus: newErrors.focus || null,
                fields: _.unique([...errors.fields, ...newErrors.fields]),
                errors: _.unique([...errors.errors, ...newErrors.errors]),
            };
        }

        return { valid, errors };
    };

    const complete = () => {
        const { value, error, status } = stateRef.current;
        onComplete({ value, error, status });
    };

    const submit = async e => {
        if (e) {
            e.preventDefault();
        }

        const { status } = stateRef.current;
        if (status === ENUMS.STATUS.SENDING) {
            return;
        }

        setState({ errors: null });

        const value = getValue();

        const { valid, errors } = await validate(value);

        await onBeforeSubmit({ value, valid, errors });

        if (valid !== true) {
            setState({ errors });
            onError({ errors, value });
            return;
        }

        if (!op.has(value, 'type')) {
            value.type = id || name || 'form';
        }

        setState({ status: ENUMS.STATUS.SENDING });

        try {
            await onSubmit({ value, valid });

            setState({ status: ENUMS.STATUS.COMPLETE });
        } catch (error) {
            setState({ error, status: ENUMS.STATUS.ERROR });
        }

        complete();
    };

    const render = () => {
        const cname = cn({
            [className]: !!className,
            [namespace]: !!namespace,
        });
        const errors = op.get(stateRef, 'current.errors');

        return (
            <form
                className={cname}
                {...formProps}
                onChange={onChange}
                onSubmit={submit}
                ref={formRef}>
                {errors && showError === true && (
                    <ul className='webform-error'>
                        {errors.errors.map(error => (
                            <li className='webform-error-item' key={error}>
                                {error}
                            </li>
                        ))}
                    </ul>
                )}
                {children}
            </form>
        );
    };

    const getFormRef = () => formRef.current;

    const getChildren = () => children;

    // External Interface
    useImperativeHandle(ref, () => ({
        children: getChildren(),
        errors: op.get(stateRef.current, 'errors'),
        setState,
        update,
        getValue,
        focus,
        form: getFormRef(),
        submit,
        validate,
        refresh: () => applyValue(),
    }));

    return render();
};

WebForm = forwardRef(WebForm);

WebForm.ENUMS = ENUMS;

WebForm.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    required: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    onBeforeSubmit: PropTypes.func,
    onComplete: PropTypes.func,
    onError: PropTypes.func,
    onSubmit: PropTypes.func,
    onUpdate: PropTypes.func,
    showError: PropTypes.bool,
    validator: PropTypes.func,
    value: PropTypes.object,
    name: PropTypes.string.isRequired,
    id: PropTypes.string,
};

WebForm.defaultProps = {
    className: 'webform',
    required: [],
    onBeforeSubmit: noop,
    onComplete: noop,
    onError: noop,
    onSubmit: null,
    onUpdate: noop,
    showError: true,
    validator: (value, valid = true, errors) => ({ valid, errors }),
    name: 'form',
    value: {},
    valueUpdated: null,
};

export { WebForm, WebForm as default };
