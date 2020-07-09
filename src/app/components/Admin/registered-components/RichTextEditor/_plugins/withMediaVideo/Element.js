import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { Editor, Transforms } from 'slate';
import { useHookComponent } from 'reactium-core/sdk';
import { ReactEditor, useEditor, useSelected } from 'slate-react';

export default props => {
    const { ID, children, ext, src } = props;

    const editor = useEditor();
    const selected = useSelected();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const getSelection = () => {
        const nodes = Array.from(Editor.nodes(editor, { at: [] }));

        if (nodes.length < 1) return;

        let output;

        for (let i = 0; i < nodes.length; i++) {
            const [node, selection] = nodes[i];
            if (!op.has(node, 'children')) continue;
            const c = _.findIndex(node.children, { ID });

            if (c > -1) {
                selection.push(c);
                output = selection;
            }
        }

        return output;
    };

    const onDelete = e => {
        e.preventDefault();
        const selection = getSelection();
        Transforms.removeNodes(editor, { at: selection });
        ReactEditor.focus(editor);
    };

    return (
        <div
            id={ID}
            className={cn({ selected })}
            tabIndex={1}
            type='embed'
            contentEditable={false}>
            {children}
            <video width='100%' height='100%' controls>
                <source src={src} type={`video/${ext}`} />
            </video>
            <span className='actions'>
                <Button
                    appearance='circle'
                    color='danger'
                    onClick={onDelete}
                    size='sm'
                    type='button'>
                    <Icon name='Feather.X' />
                </Button>
            </span>
        </div>
    );
};
