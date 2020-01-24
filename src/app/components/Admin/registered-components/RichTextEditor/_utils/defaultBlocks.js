import React from 'react';
import ENUMS from '../enums';
import Reactium from 'reactium-core/sdk';
import { isBlockActive, toggleBlock } from './index';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const { STATUS } = ENUMS;
const buttonProps = ENUMS.PROPS.BUTTON;
const iconProps = ENUMS.PROPS.ICON;

const blocks = {
    ol: {
        order: 210,
        toolbar: true,
        sidebar: true,
        block: props => <ol {...props} />,
        button: ({ editor, ...props }) => (
            <Button
                {...buttonProps}
                active={isBlockActive(editor, 'ol')}
                onClick={e => toggleBlock(editor, 'ol', e)}
                {...props}>
                <Icon {...iconProps} name='Linear.List2' />
            </Button>
        ),
    },
    ul: {
        order: 220,
        toolbar: true,
        sidebar: true,
        block: props => <ul {...props} />,
        button: ({ editor, ...props }) => (
            <Button
                {...buttonProps}
                active={isBlockActive(editor, 'ul')}
                onClick={e => toggleBlock(editor, 'ul', e)}
                {...props}>
                <Icon {...iconProps} name='Linear.List' />
            </Button>
        ),
    },
    li: {
        block: props => <li {...props} />,
    },
    p: {
        block: props => <p {...props} />,
    },
};

export default blocks;
