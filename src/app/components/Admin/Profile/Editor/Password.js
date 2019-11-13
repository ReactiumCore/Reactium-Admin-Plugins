import React from 'react';
import op from 'object-path';
import ConfirmBox from 'components/Admin/ConfirmBox';
import Reactium, { useHandle, useSelect } from 'reactium-core/sdk';
import { Button, Spinner } from '@atomic-reactor/reactium-ui';

export default ({ onClick, disabled = false, state, ...props }) => {
    const history = useSelect(state => op.get(state, 'Router.history'));

    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    // Kick off reset password routine.
    const resetPassword = async () => {
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
                history.replace(`/reset/${token}`);
                resolve();
            }, 3000),
        );
    };

    // Confirm password reset
    const resetConfirm = () => {
        if (disabled) {
            return;
        }

        const Message = () => (
            <>
                <p>Resetting your password will sign you out.</p>
                Are you sure?
            </>
        );

        Modal.show(
            <ConfirmBox
                title='Reset Password'
                message={<Message />}
                onConfirm={resetPassword}
            />,
        );
    };

    const render = () => (
        <div className='flex middle mt-xs-40 mb-xs-20'>
            <h3 className='flex-grow'>Password</h3>
            <Button
                appearance='pill'
                color='tertiary'
                size='xs'
                type='button'
                onClick={resetConfirm}>
                Reset
            </Button>
        </div>
    );

    return render();
};
