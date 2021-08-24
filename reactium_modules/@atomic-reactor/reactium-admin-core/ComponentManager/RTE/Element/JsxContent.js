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
        let { node, path } = getNode();

        node = JSON.parse(JSON.stringify(node));
        node.children = Reactium.RTE.removeEmptyNodes(content);

        Transforms.delete(editor, { at: path, unit: 'line' });
        Transforms.insertNodes(editor, node, { at: path });
    };

    const showEditor = () => {
        const { node } = getNode();

        const content = {
            type: 'div',
            children: isEmpty
                ? [Reactium.RTE.emptyNode]
                : Reactium.RTE.removeEmptyNodes(node.children),
        };

        const rte = refs.get('rte');
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
                    onClick={showEditor}>
                    {isEmpty ? __('Content') : __('Edit Content')}
                </Button>
            </div>
        </div>
    );
};

export { JsxContent, JsxContent as default };
