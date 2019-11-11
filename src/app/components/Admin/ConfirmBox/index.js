import React from 'react';
import op from 'object-path';
import { useHandle } from 'reactium-core/sdk';
import { Button, Dialog } from '@atomic-reactor/reactium-ui';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ConfirmBox
 * -----------------------------------------------------------------------------
 */
const ConfirmBox = ({
    buttons,
    message,
    onConfirm,
    onCancel,
    style,
    title,
    ...props
}) => {
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const _onCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            Modal.dismiss();
        }
    };

    const _onConfirm = () => {
        if (onConfirm) {
            onConfirm();
        } else {
            Modal.dismiss();
        }
    };

    const Buttons = () =>
        Object.values(buttons).map((btn, i) => {
            if (op.get(btn, 'label')) {
                const onClick =
                    op.get(btn, 'confirm', false) === true
                        ? _onConfirm
                        : _onCancel;

                const clr =
                    op.get(btn, 'cancel') === true ? 'danger' : 'primary';

                return (
                    <Button
                        key={`confirm-box-button-${i}`}
                        size='sm'
                        type='button'
                        color={clr}
                        onClick={onClick}>
                        {btn.label}
                    </Button>
                );
            } else {
                return <span key={`confirm-box-button-${i}`}>{btn}</span>;
            }
        });

    return (
        <div className='admin-confirm-box' style={style}>
            <Dialog header={{ title }} {...props} onDismiss={_onCancel}>
                <div className='admin-confirm-box-message'>{message}</div>
                <div className='admin-confirm-box-buttons'>
                    <Buttons />
                </div>
            </Dialog>
        </div>
    );
};

ConfirmBox.defaultProps = {
    collapsible: false,
    dismissable: true,
    title: 'Confirm',
    message: 'Confirm something',
    buttons: {
        no: {
            label: 'No',
            cancel: true,
        },
        yes: {
            label: 'Yes',
            confirm: true,
        },
    },
};

export default ConfirmBox;
