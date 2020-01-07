import React, { useRef, useState } from 'react';
import { Button } from '@atomic-reactor/reactium-ui';
import Reactium, { __ } from 'reactium-core/sdk';
import op from 'object-path';
import cn from 'classnames';

export default props => {
    const id = op.get(props, 'id');
    const error = op.get(props, 'error', false);
    const isNew = id === 'new';

    const renderNameInput = () => {
        return (
            <div className={cn('form-group', { error })}>
                <input
                    type='text'
                    autoComplete='off'
                    name='type'
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
