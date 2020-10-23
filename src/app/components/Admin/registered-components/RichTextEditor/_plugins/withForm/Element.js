import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { useEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import { useHookComponent } from 'reactium-core/sdk';

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

    const _showProperties = () => {};

    return (
        <div className={cn('rte-form-element', element)}>
            <span className='label'>{children}</span>
            <Button
                appearance='circle'
                contentEditable={false}
                color='danger'
                className='delete-btn'
                onClick={_delete}>
                <Icon name='Feather.X' />
            </Button>
            <Button
                contentEditable={false}
                color='clear'
                className='edit-btn'
                onClick={_showProperties}>
                <Icon name='Feather.Sliders' />
            </Button>
        </div>
    );
};

export { Element, Element as default };
