import React from 'react';
import uuid from 'uuid/v4';
import { Transforms } from 'slate';
import { useEditor } from 'slate-react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const editor = useEditor();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const onClick = () => {
        Transforms.insertNodes(editor, {
            id: uuid(),
            children: [{ text: '' }],
            content: [{ children: [{ text: '' }], type: 'empty' }],
            tabs: ['Tab 1'],
            type: 'tabs',
            vertical: false,
        });
        Transforms.insertNodes(editor, { children: [{ text: '' }], type: 'p' });
    };

    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            onClick={onClick}
            data-tooltip={__('Add Tabs')}
            data-vertical-align='middle'
            data-align='right'
            {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Linear.NewTab'
                size={18}
            />
        </Button>
    );
};
