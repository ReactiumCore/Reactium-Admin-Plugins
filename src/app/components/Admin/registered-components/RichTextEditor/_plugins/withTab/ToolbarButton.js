import React from 'react';
import uuid from 'uuid/v4';
import { useEditor } from 'slate-react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const editor = useEditor();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const insertNode = () => {
        const id = uuid();
        const node = {
            id,
            children: [{ text: '' }],
            content: [{ children: [{ text: '' }], type: 'empty' }],
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
            onClick={insertNode}
            {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Linear.NewTab'
                size={18}
            />
        </Button>
    );
};
