import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useState } from 'react';
import { useHandle } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import ActivityLog from '../index';

export default ({ editor }) => {
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const [visible, setVisible] = useState(false);

    const show = () => {
        Modal.show(<ActivityLog />);
    };

    return editor.isNew() ? null : (
        <Button
            color='clear'
            data-align='left'
            data-tooltip='Activity'
            data-vertical-align='middle'
            onClick={show}
            type='button'>
            <Icon name='Feather.Activity' />
        </Button>
    );
};
