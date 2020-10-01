import React from 'react';
import uuid from 'uuid/v4';
import { useEditor } from 'slate-react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const editor = useEditor();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const insertNode = e => {
        e.preventDefault();

        const id = uuid();
        const node = {
            blockID: `block-${id}`,
            blocked: true,
            children: [{ type: 'p', children: [{ text: '' }] }],
            content: [
                {
                    children: [{ type: 'p', children: [{ text: '' }] }],
                    type: 'empty',
                },
            ],
            id,
            tabs: ['Tab 1'],
            type: 'tabs',
            vertical: false,
        };

        Reactium.RTE.insertBlock(editor, node, { id });
    };

    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            data-tooltip={__('Add Tabs')}
            data-vertical-align='middle'
            data-align='right'
            onClick={e => insertNode(e)}
            {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Linear.NewTab'
                size={18}
            />
        </Button>
    );
};
