import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import { useEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import JsxContentRTE from './JsxContentRTE';
import { __, useHookComponent, useRefs } from 'reactium-core/sdk';

const JsxContent = ({ children, ...props }) => {
    const refs = useRefs();

    const editor = useEditor();

    const { Button } = useHookComponent('ReactiumUI');

    const getNode = () => {
        const nodes = Editor.nodes(editor, {
            at: [],
            match: ({ ID }) => ID === props.id,
        });

        let node = _.first(Array.from(nodes));
        return node ? _.object(['node', 'path'], node) : null;
    };

    const isEmpty = Editor.isEmpty(editor, getNode().node);

    const setContent = content => {
        const { node, path } = getNode();
        const start = _.flatten([path, 0]);
        const end = _.flatten([path, node.children.length - 1]);

        if (!isEmpty) {
            const r = Editor.range(
                editor,
                Editor.start(editor, start),
                Editor.end(editor, end),
            );
            Transforms.delete(editor, {
                at: r,
                unit: 'line',
                voids: true,
                hanging: true,
            });
        }

        Transforms.insertNodes(editor, content, { at: start });
    };

    const showEditor = () => {
        const { node } = getNode();

        const content = {
            type: 'div',
            children: isEmpty
                ? [{ type: 'p', children: [{ text: '' }] }]
                : node.children,
        };

        const ival = setInterval(() => {
            const rte = refs.get('rte');
            if (!rte) return;
            rte.setValue(content);
            rte.show();
            clearInterval(ival);
        }, 100);
    };

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <JsxContentRTE
                onSubmit={setContent}
                ref={elm => refs.set('rte', elm)}
            />
            {children}
            <div
                className={cn('rte-jsx-component-blocker', {
                    empty: isEmpty,
                })}>
                <Button
                    appearance={Button.ENUMS.APPEARANCE.PILL}
                    onMouseUp={showEditor}>
                    {isEmpty ? __('Content') : __('Edit Content')}
                </Button>
            </div>
        </div>
    );
};

export { JsxContent, JsxContent as default };
