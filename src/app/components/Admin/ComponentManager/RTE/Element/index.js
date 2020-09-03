import React from 'react';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import JsxParser from 'react-jsx-parser';
import { Editor, Transforms } from 'slate';
import Reactium, { useHookComponent } from 'reactium-core/sdk';
import { ReactEditor, useEditor, useSelected } from 'slate-react';

const components = () =>
    Reactium.Component.list.reduce((obj, item) => {
        const { component, id } = item;
        op.set(obj, id, component);
        return obj;
    }, {});

const HookComponent = ({ name, attributes = {} }) => {
    const Component = useHookComponent(name);
    return <Component {...attributes} />;
};

const JsxComponent = ({ jsx, attributes = {} }) => {
    return (
        <JsxParser
            bindings={attributes}
            blacklistedAttrs={[]}
            blacklistedTags={[]}
            components={components()}
            renderInWrapper={false}
            jsx={jsx}
        />
    );
};

const Element = initialProps => {
    const editor = useEditor();
    const selected = useSelected();
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const { children, className = 'component', ...props } = initialProps;

    const id = op.get(children, 'props.node.ID');
    const type = op.get(children, 'props.node.block.type');
    const attr = op.get(children, 'props.node.block.attribute', {});

    const onDelete = e => {
        e.preventDefault();
        const selection = getSelection(id);
        Transforms.removeNodes(editor, { at: selection });
        ReactEditor.focus(editor);
    };

    const getSelection = ID => {
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

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div
            className={cn(className, 'box', { selected })}
            contentEditable={false}
            suppressContentEditableWarning
            id={id}
            type='embed'>
            {type === 'hook' && (
                <HookComponent
                    {...props}
                    attributes={attr}
                    node={op.get(children, 'props.node')}
                    name={op.get(children, 'props.node.block.component')}
                />
            )}
            {type === 'jsx' && (
                <JsxComponent
                    {...props}
                    attributes={attr}
                    node={op.get(children, 'props.node')}
                    jsx={op.get(children, 'props.node.block.component')}
                />
            )}
            {children}
            <div className='actions'>
                <Button
                    appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                    className='delete-btn'
                    color={Button.ENUMS.COLOR.DANGER}
                    onClick={onDelete}>
                    <Icon name='Feather.X' />
                </Button>
            </div>
        </div>
    );
};

export default Element;
