import React, { useRef, useState } from 'react';
import { Button, Icon } from 'reactium-ui';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';
import cn from 'classnames';
import IconPicker from '../IconPicker';

export default props => {
    const id = op.get(props, 'id', 'new');
    const error = op.get(props, 'error', false);
    const isNew = id === 'new';
    const deleteLabel = isNew ? __('Clear') : __('Delete');
    const CTE = useHandle('ContentTypeEditor');
    // const tools = useHandle('AdminTools');
    // const Modal = op.get(tools, 'Modal');
    const ConfirmBox = useHookComponent('ConfirmBox');

    const onConfirm = () => {
        CTE.clearDelete();
        Reactium.State.Tools.Modal.hide();
    };

    const showModal = () => {
        console.log('showModal', Reactium.State);
        Reactium.State.Tools.Modal.show(
            <ConfirmBox
                message={__('Are you sure? This is a destructive operation.')}
                onCancel={() => Reactium.State.Tools.Modal.hide()}
                onConfirm={onConfirm}
                title={deleteLabel}
            />,
        );
    };

    const renderNameInput = () => {
        return (
            <div className={cn('input-group', { error })}>
                <IconPicker />
                <input
                    type='text'
                    autoComplete='off'
                    name='type'
                    placeholder={__('Content Type Name')}
                />
                <Button type='submit'>{__('Save')}</Button>
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
                <Button
                    data-tooltip={deleteLabel}
                    style={{ width: 50, height: 50 }}
                    color={Button.ENUMS.COLOR.DANGER}
                    onClick={showModal}>
                    <span className='sr-only'>{deleteLabel}</span>
                    <Icon.Feather.X />
                </Button>
            </div>
        </div>
    );
};
