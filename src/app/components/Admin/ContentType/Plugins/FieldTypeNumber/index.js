import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';
import { Checkbox, Slider } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeNumber
 * -----------------------------------------------------------------------------
 */
export const FieldType = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);
    const defaultValueLabel = __('Default Value');
    const minLabel = __('Min');
    const maxLabel = __('Max');

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-number'>
                <div className={'input-group'}>
                    <label className={'default-value'}>
                        <span className='sr-only'>{defaultValueLabel}</span>
                        <input
                            type='number'
                            name='defaultValue'
                            placeholder={defaultValueLabel}
                        />
                    </label>
                    <label className={'min-max'}>
                        <span className='sr-only'>{minLabel}</span>
                        <input
                            type='number'
                            name='min'
                            placeholder={minLabel}
                        />
                    </label>
                    <label className={'min-max'}>
                        <span className='sr-only'>{maxLabel}</span>
                        <input
                            type='number'
                            name='max'
                            placeholder={maxLabel}
                        />
                    </label>
                    <div className='slider-check'>
                        <Checkbox
                            name='slider'
                            label={__('Slider')}
                            labelAlign={'right'}
                            value={1}
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
        slider,
    } = props;

    const ElementDialog = useHookComponent('ElementDialog');
    const inputRef = useRef();
    const value = editor.value[fieldName];

    // Apply default value
    if (!value && defaultValue) editor.setValue({ [fieldName]: defaultValue });

    const inputProps = {
        defaultValue: defaultValue ? Number(defaultValue) : defaultValue,
        max: max ? Number(max) : max,
        min: min ? Number(min) : min,
        name: fieldName,
        placeholder,
        ref: inputRef,
        type: 'number',
    };

    const validate = ({ context, value }) => {
        const v = value[fieldName];

        if (!v) return context;

        const chk = isNaN(v);

        if (chk === true) {
            context.error[fieldName] = {
                field: fieldName,
                focus: inputRef.current,
                message: __('Invalid %fieldName: %value'),
                value: v,
            };
            context.valid = false;
        }

        return context;
    };

    const { errors } = editor;
    const errorText = op.get(errors, [fieldName, 'message']);
    const className = cn('form-group', { error: !!errorText });
    const replacers = {
        '%fieldName': fieldName,
        '%type': editor.type,
        '%value': editor.value[fieldName],
    };

    useEffect(() => {
        if (editor.unMounted()) return;
        editor.addEventListener('validate', validate);
        return () => {
            editor.removeEventListener('validate', validate);
        };
    }, []);

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
                    {errorText && (
                        <small>
                            {editor.parseErrorMessage(errorText, replacers)}
                        </small>
                    )}
                </div>
            </div>
        </ElementDialog>
    );
};
