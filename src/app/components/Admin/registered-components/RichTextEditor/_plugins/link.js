import React from 'react';
import op from 'object-path';
import RTEPlugin from '../RTEPlugin';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useDerivedState } from 'reactium-core/sdk';

const Plugin = new RTEPlugin({ type: 'link', order: 1000 });

Plugin.callback = editor => {
    const buttonProps = Reactium.RTE.ENUMS.PROPS.BUTTON;
    const iconProps = Reactium.RTE.ENUMS.PROPS.ICON;

    const onSidebarClick = (e, editor) => {};

    const onToolbarClick = (e, editor) =>
        Reactium.RTE.toggleMark(editor, Plugin.type, e);

    const onButtonClick = (e, editor) => {
        const isSidebar = op.has(e.currentTarget.dataset, 'sidebar');
        const isToolbar = op.has(e.currentTarget.dataset, 'toolbar');

        if (isSidebar) return onSidebarClick(e, editor);
        if (isToolbar) return onToolbarClick(e, editor);
    };

    // register toolbar button
    Reactium.RTE.Format.register(Plugin.type, {
        order: 150,
        toolbar: true,
        leaf: props => <span {...props} className='red' />,
        button: ({ editor, ...props }) => (
            <Button
                {...buttonProps}
                active={Reactium.RTE.isMarkActive(editor, Plugin.type)}
                onClick={e => onButtonClick(e, editor)}
                {...props}>
                <Icon {...iconProps} name='Linear.Link2' />
            </Button>
        ),
    });

    return editor;
};

export default Plugin;
