import _ from 'underscore';
import op from 'object-path';
import Settings from './Settings';
import JsxContent from './JsxContent';
import { useEditor } from 'slate-react';
import JsxParser from 'react-jsx-parser';
import React, { useEffect, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useHookComponent,
} from 'reactium-core/sdk';

const DefaultHookComponent = name => ({ children, ...attributes }) => {
    const attrToString = () => {
        return Object.keys(attributes).length < 1
            ? ''
            : Object.entries(attributes)
                  .reduce((arr, [key, val]) => {
                      if (key && val) arr.push(`${key}='${val}'`);
                      return arr;
                  }, [])
                  .join(' ') + ' ';
    };

    return (
        <pre contentEditable={false}>
            <code>
                {`<${name} ${attrToString()}/>`}
                {children}
            </code>
        </pre>
    );
};

const components = () =>
    Reactium.Component.list.reduce((obj, item) => {
        const { component, id } = item;
        op.set(obj, id, component);
        return obj;
    }, {});

const HookComponent = ({ name, attributes = {} }) => {
    const Component = useHookComponent(name, DefaultHookComponent(name));
    return <Component {...attributes} />;
};

const JsxComponent = ({ attributes = {}, ...props }) => {
    op.set(
        attributes,
        'content',
        <JsxContent {...props} attributes={attributes} />,
    );

    const [jsx, setJSX] = useState(props.jsx);

    useAsyncEffect(async mounted => {
        let comps = await Reactium.Setting.get('components');
        if (!mounted()) return;

        comps = Object.values(comps);
        const name = op.get(props, 'node.block.name');
        const newjsx = _.findWhere(comps, { name });

        if (!newjsx) return;

        if (jsx === newjsx.component) return;

        setJSX(newjsx.component);
    }, []);

    return (
        <JsxParser
            jsx={jsx}
            blacklistedTags={[]}
            bindings={attributes}
            blacklistedAttrs={[]}
            renderInWrapper={false}
            components={components()}
        />
    );
};

const Element = initialProps => {
    const editor = useEditor();

    const { id, children, className = 'component', ...props } = initialProps;

    const type = op.get(children, 'props.node.block.type');
    const attr = { ...op.get(children, 'props.node.block.attribute', {}) };

    const getNode = () => Reactium.RTE.getNodeByID(editor, id);

    useEffect(() => {
        const zid = Reactium.Zone.addComponent({
            component: otherProps => {
                const { node, path } = getNode();
                return (
                    <SettingsButton
                        {...otherProps}
                        {...initialProps}
                        node={node}
                        path={path}
                    />
                );
            },
            order: Reactium.Enums.priority.highest,
            zone: 'block-actions-left',
        });

        return () => {
            Reactium.Zone.removeComponent(zid);
        };
    }, []);

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div contentEditable={false} className={className} id={id}>
            {type === 'hook' && (
                <>
                    <HookComponent
                        {...props}
                        attributes={attr}
                        node={op.get(children, 'props.node')}
                        name={op.get(children, 'props.node.block.component')}
                    />
                    {children}
                </>
            )}
            {type === 'jsx' && (
                <JsxComponent
                    {...props}
                    attributes={attr}
                    children={children}
                    node={op.get(children, 'props.node')}
                    jsx={op.get(children, 'props.node.block.component')}
                />
            )}
        </div>
    );
};

const SettingsButton = initialProps => {
    let { id, editor, handle, node = {}, ...props } = initialProps;

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const attributes = op.get(node, 'block.attributes', []);

    const visible = `block-${id}` === handle.id && attributes.length > 0;

    const _onClick = () => {
        const { node, path } = Reactium.RTE.getNodeByID(editor, id);

        handle.showDialog(
            { editor, id },
            <Settings
                {...props}
                id={id}
                node={node}
                path={path}
                editor={editor}
            />,
        );
    };

    return !visible ? null : (
        <Button onClick={_onClick} title={__('Image Properties')}>
            <Icon name='Linear.Beaker' size={14} />
            <span className='ml-8' style={{ fontSize: 10 }}>
                {node.block.label}
            </span>
        </Button>
    );
};

export default Element;
