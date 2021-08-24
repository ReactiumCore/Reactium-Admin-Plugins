import React from 'react';
import { useMediaFileTypes } from '../_utils';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldType
 * -----------------------------------------------------------------------------
 */
export const FieldType = props => {
    const { DragHandle, id } = props;

    const [types] = useMediaFileTypes();
    const cx = Reactium.Utils.cxFactory('field-type-media');
    const { Checkbox } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return (
        <FieldTypeDialog {...props} showHelpText={false}>
            <div className={cx()}>
                <div className='row'>
                    <div className='col-xs-12'>
                        <div className='form-group'>
                            <label>
                                <input
                                    name='max'
                                    type='number'
                                    placeholder={__('Max Items')}
                                />
                            </label>
                        </div>
                    </div>
                </div>
                <div className='my-xs-24 medium'>Media Type:</div>
                <div className='checks mb-xs-20'>
                    {types.map(({ label, value }, i) => (
                        <Checkbox
                            name='type'
                            label={label}
                            labelAlign='right'
                            value={value}
                            key={`media-type-${id}-${i}`}
                        />
                    ))}
                </div>
                <div className='checks'>
                    <Checkbox
                        name='required'
                        label={__('Required')}
                        labelAlign='right'
                        value={true}
                    />
                </div>
            </div>
        </FieldTypeDialog>
    );
};
