import React from 'react';
import cn from 'classnames';
import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';

const Plugin = new RTEPlugin({ type: 'block', order: -1 });

Plugin.callback = editor => {
    // register block format
    Reactium.RTE.Block.register('block', {
        element: ({ children, className }) => (
            <div className={cn('block', className)} contentEditable={false}>
                {children}
            </div>
        ),
    });

    // Editor overrides
    const { isInline } = editor;
    editor.isInline = element =>
        element.type === Plugin.type ? false : isInline(element);

    return editor;
};

export default Plugin;
