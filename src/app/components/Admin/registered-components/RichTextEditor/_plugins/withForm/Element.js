import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { useEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import { __, useHookComponent } from 'reactium-core/sdk';

const Element = props => {
    const editor = useEditor();
    const { children, element, id } = props;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const getNode = () => {
        const nodes = Array.from(Editor.nodes(editor, { at: [] }));
        nodes.reverse();

        if (nodes.length < 1) return;

        const result = nodes.reduce((output, [node, selection]) => {
            if (!op.get(node, 'id')) return output;
            if (op.get(node, 'id') === id && !output) {
                output = { node, selection };
            }

            return output;
        }, null);

        return result ? result : { node: null, selection: [] };
    };

    const _delete = () => {
        Transforms.collapse(editor, { edge: 'end' });

        const { node, selection } = getNode();
        if (node && selection.length > 0) {
            Transforms.delete(editor, { at: selection });
        }
    };

    return (
        <div className={cn('rte-form-element', element)}>
            {children}
            <Button
                contentEditable={false}
                color='danger'
                className='delete-btn'
                style={{ width: 24, height: 24 }}
                onClick={_delete}>
                <Icon name='Feather.X' />
            </Button>
        </div>
    );
};

export { Element, Element as default };
