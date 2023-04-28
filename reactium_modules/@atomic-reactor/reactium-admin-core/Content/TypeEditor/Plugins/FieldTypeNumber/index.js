import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';
import React, { useEffect, useRef } from 'react';
import { Dialog, Checkbox, Slider } from 'reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeNumber
 * -----------------------------------------------------------------------------
 */
export const FieldType = props => {
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

const NumberSlider = props => {
    const { editor, fieldName } = props;
    const min = Number(op.get(props, 'min', 0));
    const max = Number(op.get(props, 'max', 100));
    const defaultValue = Number(
        op.get(props, 'defaultValue', Math.ceil(max / 2)),
    );
    const value = Number(op.get(editor, ['value', fieldName], defaultValue));

    const _onChange = e =>
        _.defer(() => editor.setValue({ [fieldName]: Number(e.value) }));

    const onChange = _.throttle(_onChange, 250, { trailing: true });
    const tick = Math.floor(max * 0.25);
    const ticks = _.chain([[min], _.range(min, max, tick), [max]])
        .flatten()
        .uniq()
        .value();

    return (
        <div className='pt-xs-40 px-xs-12'>
            <Slider
                max={max}
                min={min}
                name={fieldName}
                onChange={onChange}
                snap
                ticks={ticks}
                value={value}
            />
        </div>
    );
};

export const Editor = props => {
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
    const replacers = {
        '%fieldName': fieldName,
        '%type': editor.type,
        '%max': max,
        '%min': min,
    };

    const validate = ({ context, value }) => {
        const v = value[fieldName];

        const err = {
            field: fieldName,
            focus: inputRef.current,
            message: null,
            value: v,
        };

        if (required === true && !v) {
            err.message = __('%fieldName is required');
        }

        if (min && Number(v) < Number(min)) {
            err.message = __('%fieldName minimum value %min');
        }

        if (max && Number(v) > Number(max)) {
            err.message = __('%fieldName maximum value %max');
        }

        if (err.message !== null) {
            err.message = editor.parseErrorMessage(err.message, replacers);
            context.error[fieldName] = err;
            context.valid = false;
        }

        return context;
    };

    useEffect(() => {
        editor.addEventListener('validate', validate);
        return () => {
            editor.removeEventListener('validate', validate);
        };
    }, [editor]);

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20'>
                <div className={className}>
                    {!slider ? (
                        <label>
                            <span className='sr-only'>
                                {placeholder || fieldName}
                            </span>
                            <input {...inputProps} />
                        </label>
                    ) : (
                        <NumberSlider {...props} />
                    )}
                    {errorText && <small>{errorText}</small>}
                </div>
            </div>
        </ElementDialog>
    );
};

export const Comparison = props => {
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
