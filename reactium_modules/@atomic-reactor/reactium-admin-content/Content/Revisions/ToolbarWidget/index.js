import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useState } from 'react';
import { useHandle } from 'reactium-core/sdk';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Revisions from '../index';

export default ({ editor }) => {
    const tools = useHandle('AdminTools');

    const Modal = op.get(tools, 'Modal');

    const [visible, setVisible] = useState(false);

    const show = () => {
        Modal.show(
            <Revisions
                startingContent={editor.value}
                onClose={() => Modal.hide()}
                editor={editor}
            />,
        );
    };

    return editor.isNew() ? null : (
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
