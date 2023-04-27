import _ from 'underscore';
import React, { useEffect, useState, useCallback } from 'react';
import op from 'object-path';
import Reactium, { useHandle, useHookComponent } from 'reactium-core/sdk';

const noop = {
    dismiss: () => {},
    show: () => {},
};

const Widget = () => {
    const ConfirmBox = useHookComponent('ConfirmBox');
    const MenuItem = useHookComponent('MenuItem');

    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    console.log({ Modal });

    const confirm = () => {
        Reactium.Routing.history.replace('/logout');
        Modal.dismiss();
    };

    const showModal = useCallback(() => {
        Modal.show(
            <ConfirmBox
                message='Are you sure?'
                onCancel={() => Modal.hide()}
                onConfirm={() => confirm()}
                title='Sign Out'
            />,
        );
    }, [Modal]);

    const render = useCallback(
        () => (
            <>
                <MenuItem
                    label='Sign Out'
                    onClick={showModal}
                    icon='Linear.PowerSwitch'
                    isActive={() => false}
                />
            </>
        ),
        [showModal],
    );

    return render();
};

export default Widget;
