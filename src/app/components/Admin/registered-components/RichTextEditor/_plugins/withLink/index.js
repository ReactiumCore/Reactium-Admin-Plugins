import _ from 'underscore';
import Panel from './Panel';
import cn from 'classnames';
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
        element: elementProps => {
            const { button, className, style = {}, ...props } = elementProps;

            op.del(props, 'content');
            op.del(props, 'type');

            let cls = null;

            if (button) {
                cls = _.chain([
                    'btn',
                    op.get(button, 'color'),
                    op.get(button, 'size'),
                    op.get(button, 'outline'),
                    op.get(button, 'appearance'),
                ])
                    .flatten()
                    .compact()
                    .value()
                    .join('-');

                op.set(style, 'width', op.get(button, 'width'));
                op.set(style, 'height', op.get(button, 'height'));
            } else {
                className = className || 'link';
            }

            return (
                <a {...props} style={style} className={cn(className, cls)} />
            );
        },
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
                        return false;
                    }

                    return node ? op.get(node, 'type') === Plugin.type : false;
                } catch (err) {
                    return false;
                }
            };

            const onButtonClick = e => {
                if (e) e.preventDefault();

                const x = window.innerWidth / 2 - 150;
                const y = 50;

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
