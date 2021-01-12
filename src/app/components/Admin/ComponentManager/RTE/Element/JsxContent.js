import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import { useEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import JsxContentRTE from './JsxContentRTE';
import Reactium, { __, useHookComponent, useRefs } from 'reactium-core/sdk';

const JsxContent = ({ children, ...props }) => {
    const refs = useRefs();

    const editor = useEditor();

    const { Button } = useHookComponent('ReactiumUI');

    const getNode = () => Reactium.RTE.getNodeByID(editor, props.node.ID);

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
            children: isEmpty ? [Reactium.RTE.emptyNode] : node.children,
        };

        const rte = refs.get('rte');
        if (!rte) return;
        rte.setValue(content);
        rte.show();
    };

    return (
        <div
            style={{ width: '100%', position: 'relative' }}
            contentEditable={false}>
            <JsxContentRTE
                onSubmit={setContent}
                ref={elm => refs.set('rte', elm)}
            />
            {children}
            <div
                contentEditable={false}
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
