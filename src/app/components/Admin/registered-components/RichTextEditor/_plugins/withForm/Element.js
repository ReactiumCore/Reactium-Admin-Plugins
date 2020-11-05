import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Panel from './Settings';
import { useEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import { useHookComponent } from 'reactium-core/sdk';

const Element = props => {
    const editor = useEditor();
    const { children, element, id } = props;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const nodeProps = op.get(props, 'nodeProps', {});

    const { className, style } = nodeProps;

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

    const showPanel = () =>
        editor.panel
            .setID('rte-settings')
            .setContent(<Panel {...props} {...getNode()} />)
            .show();

    return (
        <>
            {nodeProps.label && (
                <div className='rte-form-element-label' contentEditable={false}>
                    {nodeProps.label}
                </div>
            )}
            <div
                className={cn(
                    'rte-form-element',
                    element,
                    element !== 'button' ? className : null,
                    {
                        checked: nodeProps.checked,
                    },
                )}
                style={style}>
                <span
                    className={
                        element === 'button' && className
                            ? className
                            : 'placeholder'
                    }>
                    {children}
                </span>
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
                    onClick={showPanel}>
                    <Icon name='Feather.Sliders' />
                </Button>
                {nodeProps.checked && element === 'checkbox' && (
                    <Icon
                        name='Feather.Check'
                        contentEditable={false}
                        className='check'
                    />
                )}
            </div>
        </>
    );
};

export { Element, Element as default };
