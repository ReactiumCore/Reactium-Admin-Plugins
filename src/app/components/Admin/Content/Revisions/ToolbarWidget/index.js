import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useState } from 'react';
import { useHandle } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

export default ({ editor }) => {
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const [visible, setVisible] = useState(false);

    const show = () => {
        Modal.show(
            <img
                src='https://cdn.reactium.io/activity-comp.png'
                style={{
                    width: '100vw',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
            />,
        );
    };

    return (
        <Button
            color='clear'
            data-align='left'
            data-tooltip='Revisions'
            data-vertical-align='middle'
            onClick={show}
            type='button'>
            <Icon name='Feather.GitBranch' />
        </Button>
    );
};
