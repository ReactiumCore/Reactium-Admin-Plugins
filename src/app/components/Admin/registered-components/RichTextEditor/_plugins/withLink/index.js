import Panel from './Panel';
import op from 'object-path';
import { Editor } from 'slate';
import { useEditor } from 'slate-react';
import RTEPlugin from '../../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import React, { useEffect, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

const Plugin = new RTEPlugin({ type: 'link', order: 100 });

Plugin.callback = editor => {
    // register leaf format
    Reactium.RTE.Format.register(Plugin.type, {
        element: ({ type, ...props }) => <a {...props} className='blue link' />,
    });

    // register toolbar button
    Reactium.RTE.Button.register(Plugin.type, {
        order: 52,
        toolbar: true,
        button: props => {
            const editor = useEditor();
            const [active, setActive] = useState(false);

            const isActive = () => {
                if (!editor.selection) return false;

                try {
                    const node = op.get(
                        Editor.parent(editor, editor.selection),
                        '0',
                    );

                    if (!op.get(node, 'type')) {
                        return true;
                    }

                    return node ? op.get(node, 'type') === Plugin.type : false;
                } catch (err) {
                    return false;
                }
            };

            const onButtonClick = e => {
                const btn = e.currentTarget;
                let {
                    x,
                    y,
                } = editor.toolbar.container.current.getBoundingClientRect();

                editor.panel
                    .setID('link')
                    .setContent(<Panel selection={editor.selection} />)
                    .moveTo(x, y)
                    .show();
            };

            useEffect(() => {
                const activeCheck = isActive();
                if (active !== activeCheck) setActive(activeCheck);
            }, [editor.selection]);

            return (
                <Button
                    {...Reactium.RTE.ENUMS.PROPS.BUTTON}
                    active={active}
                    onClick={onButtonClick}
                    {...props}>
                    <Icon
                        {...Reactium.RTE.ENUMS.PROPS.ICON}
                        name='Feather.Link'
                    />
                </Button>
            );
        },
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = element =>
        element.type === Plugin.type ? true : isInline(element);

    return editor;
};

export default Plugin;
