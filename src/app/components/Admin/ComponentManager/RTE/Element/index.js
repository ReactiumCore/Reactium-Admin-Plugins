import React from 'react';
import op from 'object-path';
import JsxParser from 'react-jsx-parser';
import Reactium, { useHookComponent } from 'reactium-core/sdk';

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
    const { children, className = 'component', ...props } = initialProps;
    const id = op.get(children, 'props.node.ID');
    const type = op.get(children, 'props.node.block.type');
    const attr = op.get(children, 'props.node.block.attribute', {});

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div
            className={className}
            contentEditable={false}
            suppressContentEditableWarning
            id={id}>
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
        </div>
    );
};

export default Element;
