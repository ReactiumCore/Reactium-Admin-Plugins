import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

export const FieldType = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-wizard'>
                <div className='form-group'>
                    <label>
                        {__('Title Placeholder:')}
                        <input
                            type='text'
                            defaultValue={__('Title')}
                            name='placeholder.title'
                            placeholder={__('Title')}
                        />
                    </label>
                </div>
                <div className='form-group'>
                    <label>
                        {__('Content Placeholder:')}
                        <input
                            type='text'
                            defaultValue={__('Content')}
                            name='placeholder.content'
                            placeholder={__('Content')}
                        />
                    </label>
                </div>
            </div>
        </FieldTypeDialog>
    );
};
