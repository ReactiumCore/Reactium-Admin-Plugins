import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
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
        <div className='pt-xs-24'>
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
        errorText,
        fieldName,
        max,
        min,
        placeholder,
        slider,
    } = props;

    const ElementDialog = useHookComponent('ElementDialog');

    const inputProps = {
        defaultValue: defaultValue ? Number(defaultValue) : defaultValue,
        max: max ? Number(max) : max,
        min: min ? Number(min) : min,
        name: fieldName,
        placeholder,
        type: 'number',
    };

    const className = cn('form-group', { error: !!errorText });

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
