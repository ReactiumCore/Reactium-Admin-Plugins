import React from 'react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

const Widget = () => {
    const MenuItem = useHookComponent('MenuItem');
    const ConfirmBox = useHookComponent('ConfirmBox');

    const cancel = () => Reactium.State.Tools.Modal.hide();

    const confirm = () => {
        Reactium.State.Tools.Modal.dismiss();
        Reactium.Routing.history.replace('/logout');
    };

    const showModal = () =>
        Reactium.State.Tools.Modal.show(
            <ConfirmBox
                onCancel={cancel}
                onConfirm={confirm}
                title={__('Sign Out')}
                message={__('Are you sure?')}
            />,
        );

    return (
        <MenuItem
            onClick={showModal}
            label={__('Sign Out')}
            isActive={() => false}
            icon='Linear.PowerSwitch'
        />
    );
};

export default Widget;
