import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { ReactEditor } from 'slate-react';
import { Editor, Node } from 'slate';
const Plugin = new RTEPlugin({ type: 'block', order: -1 });

Plugin.callback = editor => {
    // register block format
    Reactium.RTE.Block.register('block', {
        element: ({ children, className }) => (
            <div type='block' className={cn('block', className)}>
                {children}
            </div>
        ),
    });

    // register hotkey: backspace
    Reactium.RTE.Hotkey.register('block-backspace', {
        order: -100000000,
        keys: ['backspace'],
        callback: ({ editor, event }) => {
            const offset = editor.selection.focus.offset;
            const path = Array.from(editor.selection.focus.path);
            const node = Reactium.RTE.getNode({ editor, path });
            const parent = Reactium.RTE.getNode({ editor, path: node.path });

            let canDelete = offset !== 0;

            if (offset === 0 && node.empty && !parent.blocked) {
                canDelete = true;
            }

            if (offset === 0 && node.path.join(',') === '0') {
                canDelete = false;
            }

            if (!canDelete) {
                event.preventDefault();
                return false;
            }

            return true;
        },
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = element =>
        element.type === Plugin.type ? false : isInline(element);

    return editor;
};

export default Plugin;
