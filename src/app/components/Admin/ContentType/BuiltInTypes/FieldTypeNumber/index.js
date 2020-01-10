import React from 'react';
import { Checkbox } from '@atomic-reactor/reactium-ui';
import { useHookComponent, __ } from 'reactium-core/sdk';
/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeNumber
 * -----------------------------------------------------------------------------
 */
const FieldTypeNumber = props => {
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
                            value={true}
                        />
                    </div>
                </div>
            </div>
        </FieldTypeDialog>
    );
};

export default FieldTypeNumber;
