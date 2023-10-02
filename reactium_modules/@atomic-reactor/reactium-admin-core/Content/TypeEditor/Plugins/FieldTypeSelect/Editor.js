import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useMemo } from 'react';
import {
    __,
    useHookComponent,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

export const Editor = (props) => {
    const {
        editor,
        fieldName,
        placeholder,
        required = false,
        multiple,
    } = props;

    const options = useMemo(() => {
        const opts = _.isString(props.options)
            ? JSON.parse(props.options)
            : props.options;
        return Object.values(opts);
    }, [props.options]);

    const { FormRegister, FormError, Toggle } = useHookComponent('ReactiumUI');
    const ElementDialog = useHookComponent('ElementDialog');

    const state = useSyncState({
        values: op.get(editor.Form.value, fieldName, []),
    });

    const inputProps = {
        defaultValue: op.get(props, 'defaultValue', null) || null,
        name: fieldName,
        placeholder,
    };

    if (!inputProps.defaultValue) delete inputProps.defaultValue;

    const className = cn('form-group');

    const onChange = (e) => {
        const value = e.target.value;
        let values = Array.from(state.get('values'));

        if (e.target.checked) {
            values.push(value);
            values = _.uniq(values);
        } else {
            values = _.without(values, value);
        }

        state.set('values', values);
        editor.Form.setValue(fieldName, values);
    };

    const onSubmit = (e) => {
        if (!multiple) return;
        const fieldName =
            String(props.fieldName).startsWith('data.') ||
            String(props.fieldName).startsWith('meta.')
                ? props.fieldName
                : `data.${props.fieldName}`;

        const values = state.get('values') || [];

        op.set(e.value, fieldName, values);
    };

    const parseError = (str) => {
        const replacers = {
            '%fieldName': fieldName,
        };

        str = String(str);

        Object.entries(replacers).forEach(([s, v]) => {
            str = str.replace(new RegExp(s, 'gi'), v);
        });

        return str;
    };

    const validate = ({ values }) => {
        let err;

        const v = values[fieldName];

        if (!err && required === true && !v) {
            err = parseError(__('%fieldName is required'));
        }

        if (!err && multiple && Array.isArray(v) && v.length < 1) {
            err = parseError(__('%fieldName is required'));
        }

        if (err) editor.setError(fieldName, err);
    };

    useEffect(() => {
        if (!multiple) return;
        editor.addEventListener('submit', onSubmit);
        return () => {
            editor.removeEventListener('submit', onSubmit);
        };
    }, [editor]);

    useEffect(() => {
        editor.addEventListener('validate', validate);
        return () => {
            editor.removeEventListener('validate', validate);
        };
    }, [editor]);

    return (
        <FormRegister>
            <ElementDialog {...props}>
                <div className='p-xs-20'>
                    <div className={className}>
                        {!multiple ? (
                            <label>
                                <select {...inputProps}>
                                    <option value={null}>
                                        {placeholder || __('Select')}
                                    </option>
                                    {options.map(({ label, value }, i) => (
                                        <option
                                            key={`option-${i}`}
                                            value={value}
                                        >
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : (
                            <div className='row' style={{ width: '100%' }}>
                                {options.map(({ label, value }, i) => (
                                    <div
                                        key={`${inputProps.name}-checkbox-${i}`}
                                        className='col-xs-12 py-xs-8'
                                    >
                                        <Toggle
                                            label={label}
                                            labelAlign='left'
                                            value={value}
                                            onChange={onChange}
                                            checked={state
                                                .get('values')
                                                .includes(value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        <FormError name={fieldName} />
                    </div>
                </div>
            </ElementDialog>
        </FormRegister>
    );
};
