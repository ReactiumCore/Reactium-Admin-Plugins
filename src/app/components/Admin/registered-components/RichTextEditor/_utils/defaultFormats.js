import React from 'react';
import ENUMS from '../enums';
import Reactium from 'reactium-core/sdk';
import { isMarkActive, toggleMark } from './index';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const { STATUS } = ENUMS;
const buttonProps = ENUMS.PROPS.BUTTON;
const iconProps = ENUMS.PROPS.ICON;

const formats = {
    bold: {
        order: 110,
        hotkey: 'mod+b',
        toolbar: true,
        leaf: props => <strong {...props} />,
        button: ({ editor, ...props }) => (
            <Button
                {...buttonProps}
                active={isMarkActive(editor, 'bold')}
                onClick={e => toggleMark(editor, 'bold', e)}
                {...props}>
                <Icon {...iconProps} name='Linear.Bold' />
            </Button>
        ),
    },
    italic: {
        order: 120,
        hotkey: 'mod+i',
        toolbar: true,
        leaf: props => <em {...props} />,
        button: ({ editor, ...props }) => (
            <Button
                {...buttonProps}
                active={isMarkActive(editor, 'italic')}
                onClick={e => toggleMark(editor, 'italic', e)}
                {...props}>
                <Icon {...iconProps} size={16} name='Linear.Italic' />
            </Button>
        ),
    },
    underline: {
        order: 130,
        hotkey: 'mod+u',
        toolbar: true,
        leaf: props => <u {...props} />,
        button: ({ editor, ...props }) => (
            <Button
                {...buttonProps}
                active={isMarkActive(editor, 'underline')}
                onClick={e => toggleMark(editor, 'underline', e)}
                {...props}>
                <Icon {...iconProps} name='Linear.Underline' />
            </Button>
        ),
    },
    strike: {
        order: 140,
        hotkey: 'mod+-',
        toolbar: true,
        leaf: props => <span className='strike' {...props} />,
        button: ({ editor, ...props }) => (
            <Button
                {...buttonProps}
                active={isMarkActive(editor, 'strike')}
                onClick={e => toggleMark(editor, 'strike', e)}
                {...props}>
                <Icon {...iconProps} name='Linear.Strikethrough' />
            </Button>
        ),
    },
};

export default formats;
