import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { __, useHookComponent } from '@atomic-reactor/reactium-core/sdk';
import React, { useEffect, useRef } from 'react';
import { Dialog, Checkbox, Slider } from 'reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeNumber
 * -----------------------------------------------------------------------------
 */
export const FieldType = (props) => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-number'>
                <div className={'input-group'}>
                    <label className={'default-value'}>
                        <span className='sr-only'>{__('Default Value')}</span>
                        <input
                            type='number'
                            name='defaultValue'
                            placeholder={__('Default Value')}
                        />
                    </label>
                    <label className={'min-max'}>
                        <span className='sr-only'>{__('Min')}</span>
                        <input
                            type='number'
                            name='min'
                            placeholder={__('Min')}
                        />
                    </label>
                    <label className={'min-max'}>
                        <span className='sr-only'>{__('Max')}</span>
                        <input
                            type='number'
                            name='max'
                            placeholder={__('Max')}
                        />
                    </label>
                    <div className='checks'>
                        <Checkbox
                            name='slider'
                            label={__('Slider')}
                            labelAlign='right'
                            value={true}
                        />
                        <Checkbox
                            name='required'
                            label={__('Required')}
                            labelAlign='right'
                            value={true}
                        />
                    </div>
                </div>
            </div>
        </FieldTypeDialog>
    );
};

const NumberSlider = (props) => {
    const { defaultValue, editor, fieldName } = props;
    const min = Number(op.get(props, 'min', 0));
    const max = Number(op.get(props, 'max', 100));

    const median = (arr) => {
        const mid = Math.floor(arr.length / 2),
            nums = [...arr].sort((a, b) => a - b);
        return arr.length % 2 !== 0
            ? nums[mid]
            : (nums[mid - 1] + nums[mid]) / 2;
    };

    const value = editor.isNew ? defaultValue : editor.Form.value[fieldName];

    const _onChange = (e) => editor.setValue(fieldName, Number(e.value));

    const onChange = _.throttle(_onChange, 250, { trailing: true });
    const ticks = [min, median([min, max]), max];

    return !editor.Form ? null : (
        <div className='pt-xs-20 px-xs-12'>
            <Slider
                snap
                max={max}
                min={min}
                ticks={ticks}
                name={fieldName}
                onChange={onChange}
                value={Number(value)}
            />
        </div>
    );
};

export const Editor = (props) => {
    const {
        defaultValue,
        editor,
        fieldName,
        max,
        min,
        placeholder,
        required,
        slider = false,
    } = props;

    const inputRef = useRef();
    const ElementDialog = useHookComponent('ElementDialog');
    const { FormError, FormRegister } = useHookComponent('ReactiumUI');

    const inputProps = {
        defaultValue,
        max: max ? Number(max) : max,
        min: min ? Number(min) : min,
        name: fieldName,
        placeholder,
        ref: inputRef,
        type: 'number',
    };

    const { errors } = editor;
    const errorText = op.get(errors, [fieldName, 'message']);
    const className = cn('form-group', { error: !!errorText });

    const parseError = (str) => {
        const replacers = {
            '%fieldName': fieldName,
            '%max': max,
            '%min': min,
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

        if (!err && !v && required === true) {
            err = parseError(__('%fieldName is required'));
        }

        if (!err && v && min && Number(v) < Number(min)) {
            err = parseError(__('%fieldName minimum value %min'));
        }

        if (!err && v && max && Number(v) > Number(max)) {
            err = parseError(__('%fieldName maximum value %max'));
        }

        if (err) editor.setError(fieldName, err);
    };

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
                        {slider && min && max ? (
                            <NumberSlider {...props} />
                        ) : (
                            <label>
                                <span className='sr-only'>
                                    {placeholder || fieldName}
                                </span>

                                <input {...inputProps} />
                            </label>
                        )}
                        <FormError name={fieldName} />
                    </div>
                </div>
            </ElementDialog>
        </FormRegister>
    );
};

export const Comparison = (props) => {
    const field = op.get(props, 'field', {});
    const value = op.get(props, 'value');
    const { fieldName: title } = field;

    return (
        <Dialog header={{ title }} collapsible={false}>
            <div className='p-xs-20' style={{ minHeight: '60px' }}>
                {value ? value : null}
            </div>
        </Dialog>
    );
};
