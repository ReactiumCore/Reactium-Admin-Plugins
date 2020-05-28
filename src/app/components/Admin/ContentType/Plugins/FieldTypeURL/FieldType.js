import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const { DragHandle } = props;
    const { Checkbox } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-url'>
                <div className='flex-grow'>
                    <div className='form-group'>
                        <label className='placeholder'>
                            <span className='sr-only'>{__('Placeholder')}</span>
                            <input
                                type='text'
                                name='placeholder'
                                placeholder={__('Placeholder')}
                            />
                        </label>
                    </div>
                </div>
                <div className='required'>
                    <Checkbox
                        name='required'
                        label={__('Required')}
                        labelAlign='right'
                        value={1}
                    />
                </div>
            </div>
        </FieldTypeDialog>
    );
};
