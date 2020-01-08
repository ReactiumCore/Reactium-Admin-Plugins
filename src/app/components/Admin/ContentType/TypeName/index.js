import React, { useRef, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';
import cn from 'classnames';

export default props => {
    const id = op.get(props, 'id', 'new');
    const error = op.get(props, 'error', false);
    const isNew = id === 'new';
    const deleteLabel = isNew ? __('Clear') : __('Delete');
    const handle = useHandle('ContentTypeEditor');
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    const ConfirmBox = useHookComponent('ConfirmBox');

    const onConfirm = () => {
        handle.clearDelete();
        Modal.hide();
    };

    const showModal = () =>
        Modal.show(
            <ConfirmBox
                message={__('Are you sure? This is a destructive operation.')}
                onCancel={() => Modal.hide()}
                onConfirm={onConfirm}
                title={deleteLabel}
            />,
        );

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
                <Button
                    data-tooltip={deleteLabel}
                    style={{ marginLeft: 4, width: 50, height: 50 }}
                    color={Button.ENUMS.COLOR.DANGER}
                    onClick={showModal}>
                    <span className='sr-only'>{deleteLabel}</span>
                    <Icon.Feather.X />
                </Button>
            </div>
        </div>
    );
};
