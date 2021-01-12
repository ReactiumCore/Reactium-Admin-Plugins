import React from 'react';
import uuid from 'uuid/v4';
import { useEditor } from 'slate-react';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const editor = useEditor();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const selection = editor.selection ||
        editor.lastSelection || [Math.max(editor.children.length - 1, 0)];

    const insertNode = e => {
        e.preventDefault();

        const id = uuid();
        const node = {
            blockID: `block-${id}`,
            blocked: true,
            children: [Reactium.RTE.emptyNode],
            content: [
                {
                    children: [Reactium.RTE.emptyNode],
                    type: 'empty',
                },
            ],
            id,
            tabs: ['Tab 1'],
            type: 'tabs',
            vertical: false,
        };

        Reactium.RTE.insertBlock(editor, node, { id, at: selection });
    };

    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            data-tooltip={__('Add Tabs')}
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
