import React from 'react';
import { Icon, Dialog, Button } from '@atomic-reactor/reactium-ui';
import Reactium, { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';

const BigRed = props => {
    const tools = useHandle('AdminTools');
    const Modal = op.get(tools, 'Modal');
    const Toast = op.get(tools, 'Toast');
    const ConfirmBox = useHookComponent('ConfirmBox');
    const title = __('Actinium Reset');
    const dialogSettings = {
        header: {
            title,
        },
        dismissable: false,
    };

    const confirm = async () => {
        try {
            await Reactium.Cloud.run('reset-actinium');
            Toast.show({
                type: Toast.TYPE.SUCCESS,
                message: __('Success! You should restart Actinium.'),
                icon: <Icon.Feather.Check style={{ marginRight: 12 }} />,
            });
        } catch (error) {
            Toast.show({
                type: Toast.TYPE.ERROR,
                message: __('Error resetting actinium!'),
                icon: <Icon.Feather.AlertOctagon style={{ marginRight: 12 }} />,
            });
            console.error(error);
        }

        Modal.dismiss();
    };

    const showModal = () =>
        Modal.show(
            <ConfirmBox
                message={__('Are you sure? This is a destructive operation.')}
                onCancel={() => Modal.hide()}
                onConfirm={confirm}
                title={title}
            />,
        );

    return (
        <Dialog {...dialogSettings}>
            <div className='plugin-settings-reset'>
                <Button
                    color={Button.ENUMS.COLOR.DANGER}
                    size={Button.ENUMS.SIZE.LG}
                    onClick={showModal}>
                    {__('Reset Actinium')}
                </Button>
            </div>
        </Dialog>
    );
};

export default BigRed;
