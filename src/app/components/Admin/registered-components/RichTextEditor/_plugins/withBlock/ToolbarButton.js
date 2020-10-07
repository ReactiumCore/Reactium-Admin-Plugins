import React from 'react';
import { useEditor } from 'slate-react';
import { insertBlock } from './insertBlock';
import Reactium, { __, useHookComponent } from 'reactium-core/sdk';

export default props => {
    const editor = useEditor();
    const onClick = () => insertBlock(editor);
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return (
        <Button
            {...Reactium.RTE.ENUMS.PROPS.BUTTON}
            data-tooltip={__('Add Section')}
            onClick={onClick}
            {...props}>
            <Icon
                {...Reactium.RTE.ENUMS.PROPS.ICON}
                name='Linear.PageBreak'
                size={18}
            />
        </Button>
    );
};
