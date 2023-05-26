import React from 'react';
import op from 'object-path';
import copy from 'copy-to-clipboard';
import { Button, Icon } from 'reactium-ui';
import Reactium, { __ } from '@atomic-reactor/reactium-core/sdk';

const EmailWidget = ({ user }) => {
    const { email } = user;

    const Toast = op.get(Reactium.State, 'Tools.Toast');

    const onClick = () => {
        copy(email);
        Toast.show({
            icon: 'Linear.EnvelopeOpen',
            message: `${email} ${__('copied to clipboard')}`,
            type: Toast.TYPE.INFO,
        });
    };

    const buttonProps = {
        height: 40,
        padding: 0,
    };

    return (
        <Button
            block
            color={Button.ENUMS.COLOR.CLEAR}
            onClick={onClick}
            style={buttonProps}
        >
            <Icon name='Linear.EnvelopeOpen' size={16} />
        </Button>
    );
};

export { EmailWidget, EmailWidget as default };
