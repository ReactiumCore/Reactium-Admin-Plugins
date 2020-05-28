import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const { DragHandle } = props;
    const { Checkbox } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return (
        <FieldTypeDialog {...props} showHelpText={false}>
            <div className='field-type-link'>
                <div className='input-group'>
                    <label className='placeholder'>
                        <span className='sr-only'>{__('Placeholder')}</span>
                        <input
                            type='text'
                            name='placeholder'
                            placeholder={__('Placeholder')}
                        />
                    </label>
                    <div className='required'>
                        <Checkbox
                            name='required'
                            label={__('Required')}
                            labelAlign='right'
                            value={1}
                        />
                    </div>
                </div>
            </div>
        </FieldTypeDialog>
    );
};
