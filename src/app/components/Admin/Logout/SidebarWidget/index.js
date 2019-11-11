import React from 'react';
import op from 'object-path';
import MenuItem from 'components/Admin/MenuItem';
import { Dialog } from '@atomic-reactor/reactium-ui';
import ConfirmBox from 'components/Admin/ConfirmBox';
import { useHandle, useSelect } from 'reactium-core/sdk';

const Widget = () => {
    const Router = useSelect(state => op.get(state, 'Router'));

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const confirm = () => {
        Router.history.replace('/logout');
        if (Modal) {
            Modal.dismiss();
        }
    };

    const showModal = () =>
        Modal.show(
            <ConfirmBox
                title='Sign Out'
                message='Are you sure?'
                onConfirm={confirm}
            />,
        );

    const render = () => (
        <>
            <div className='menu-break' />
            <MenuItem
                label='Sign Out'
                onClick={showModal}
                icon='Linear.PowerSwitch'
            />
        </>
    );

    return render();
};

export default Widget;
