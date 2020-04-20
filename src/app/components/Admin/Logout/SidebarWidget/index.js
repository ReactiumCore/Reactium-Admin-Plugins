import React, { useEffect, useState } from 'react';
import op from 'object-path';
import Reactium, {
    useDerivedState,
    useHandle,
    useHookComponent,
} from 'reactium-core/sdk';

const noop = {
    dismiss: () => {},
    show: () => {},
};

const Widget = () => {
    const ConfirmBox = useHookComponent('ConfirmBox');
    const MenuItem = useHookComponent('MenuItem');

    const toolsHandle = useHandle('AdminTools');

    const [tools, update] = useDerivedState(toolsHandle);

    const confirm = () => {
        Reactium.Routing.history.replace('/logout');
        tools.Modal.dismiss();
    };

    const showModal = () => {
        tools.Modal.show(
            <ConfirmBox
                message='Are you sure?'
                onCancel={() => Modal.hide()}
                onConfirm={() => confirm()}
                title='Sign Out'
            />,
        );
    };

    useEffect(() => {
        update(toolsHandle);
    }, [toolsHandle]);

    const render = () => (
        <>
            <MenuItem
                label='Sign Out'
                onClick={() => showModal()}
                icon='Linear.PowerSwitch'
                isActive={() => false}
            />
        </>
    );

    return render();
};

export default Widget;
