import React from 'react';
import { Button } from '@atomic-reactor/reactium-ui';
import { __ } from 'reactium-core/sdk';
import op from 'object-path';

export default props => {
    const id = op.get(props, 'id');
    const name = op.get(props, 'name');
    const isNew = id === 'new';

    const renderNameInput = () => {
        return (
            <div className='form-group'>
                <input
                    type='text'
                    autoComplete='off'
                    name='type-name'
                    placeholder={__('Content Type Name')}
                />
            </div>
        );
    };

    return (
        <div className='type-name'>
            <div className='type-name-header'>
                <h1 className='h2'>{__('Content Type Editor')}</h1>
            </div>
            <div className='type-name-input'>
                {renderNameInput()}
                <Button type='submit'>{__('Save')}</Button>
            </div>
        </div>
    );
};
