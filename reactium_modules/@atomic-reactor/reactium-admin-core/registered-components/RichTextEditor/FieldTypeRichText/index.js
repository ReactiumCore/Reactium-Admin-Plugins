import React from 'react';
import { __, useHookComponent } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldTypeText
 * -----------------------------------------------------------------------------
 */
const FieldTypeText = props => {
    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    return (
        <FieldTypeDialog {...props}>
            <div className='field-type-rte'>
                <div className={'form-group'}>
                    <label>
                        <span className='sr-only'>{__('Label')}</span>
                        <input
                            type='text'
                            name='label'
                            placeholder={__('Label')}
                        />
                    </label>
                </div>
                <div className={'form-group'}>
                    <label>
                        <span className='sr-only'>{__('Placeholder')}</span>
                        <input
                            type='text'
                            name='placeholder'
                            placeholder={__('Placeholder')}
                        />
                    </label>
                </div>
            </div>
        </FieldTypeDialog>
    );
};

export default FieldTypeText;
