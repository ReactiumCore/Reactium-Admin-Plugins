import cn from 'classnames';
import op from 'object-path';
import React, { useCallback } from 'react';
import ENUMS from 'components/Admin/User/enums';
import { Button, Icon, Spinner } from '@atomic-reactor/reactium-ui';
import Reactium, { useHandle, useHookComponent } from 'reactium-core/sdk';

const Message = () => (
    <>
        <p>{ENUMS.TEXT.PASSWORD.INFO}</p>
        {ENUMS.TEXT.PASSWORD.CONFIRM}
    </>
);

const Password = ({ className, disabled = false, state, user, ...props }) => {
    const ConfirmBox = useHookComponent('ConfirmBox');

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const Toast = op.get(tools, 'Toast');

    // Kick off reset password routine.
    const resetPassword = async () => {
        if (user && Reactium.User.isCurrent(user)) {
            // Update the modal content
            Modal.update(
                <div className='modal-spinner'>
                    <Spinner />
                </div>,
            );

            // Generate token
            const token = await Reactium.Cloud.run('token-gen');

            // Sign out

            await Reactium.User.logOut();

            // Hide modal and show reset screen
            await new Promise(resolve =>
                setTimeout(() => {
                    Modal.hide();
                    Reactium.Routing.history.replace(`/reset/${token}`);
                    resolve();
                }, 3000),
            );
        } else {
            Toast.show({
                autoClose: 500,
                icon: 'Linear.PaperPlane',
                message: __('Password reset sent'),
                type: Toast.TYPE.INFO,
            });
        }
    };

    // Confirm password reset
    const resetConfirm = () => {
        if (disabled) {
            return;
        }

        if (user && Reactium.User.isCurrent(user)) {
            const { buttons } = { ...ConfirmBox.defaultProps };

            op.set(buttons, 'no.label', ENUMS.TEXT.PASSWORD.NO);
            op.set(buttons, 'yes.label', ENUMS.TEXT.PASSWORD.YES);

            Modal.show(
                <ConfirmBox
                    buttons={buttons}
                    message={<Message />}
                    onCancel={() => Modal.hide()}
                    onConfirm={resetPassword}
                    title={ENUMS.TEXT.PASSWORD.TITLE}
                />,
            );
        } else {
            resetPassword();
        }
    };

    const render = () => (
        <div className={cn('flex middle mt-xs-40 mb-xs-20', className)}>
            <Icon name='Linear.UserLock' className='mr-xs-16' />
            <h2 className='flex-grow grow'>{ENUMS.TEXT.PASSWORD.LABEL}</h2>
            <Button
                appearance={Button.ENUMS.APPEARANCE.PILL}
                color={Button.ENUMS.COLOR.TERTIARY}
                onClick={resetConfirm}
                size={Button.ENUMS.SIZE.SM}
                type={Button.ENUMS.TYPE.BUTTON}>
                {ENUMS.TEXT.PASSWORD.BUTTON}
            </Button>
        </div>
    );

    return render();
};

export { Password, Password as default };
