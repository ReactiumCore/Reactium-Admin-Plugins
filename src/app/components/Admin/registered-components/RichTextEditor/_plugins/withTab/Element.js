import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useState } from 'react';
import { useEditor } from 'slate-react';
import { Editor, Transforms } from 'slate';
import TabContent from './TabContent';
import Tabs from './Tabs';
import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
} from 'reactium-core/sdk';

const Element = props => {
    const editor = useEditor();
    const node = op.get(props, 'children.props.node');

    const cx = Reactium.Utils.cxFactory('rte-tabs');

    const { vertical } = node;

    const [state, setState] = useDerivedState({
        id: node.id,
        active: 0,
        content: node.content,
        tabs: Array.from(node.tabs),
    });

    const getSelection = id => {
        const nodes = Array.from(Editor.nodes(editor, { at: [] }));

        if (nodes.length < 1) return;

        return nodes.reduce((output, [node, selection]) => {
            const { id: match } = node;

            if (match === id) {
                output = { node, selection };
            }

            return output;
        }, null);
    };

    const reorder = (start, end) => {
        if (typeof end === 'undefined') return;

        start = Number(start);
        end = Number(end);

        // Update content
        const content = Array.from(state.content);
        const [citem] = content.splice(start, 1);
        content.splice(end, 0, citem);

        // Update tabs
        const tabs = Array.from(state.tabs);
        const [item] = tabs.splice(start, 1);

        tabs.splice(end, 0, item);

        setTabs(tabs, end, true);
        setState({ tabs, content });
        setContent(end, citem);

        _.defer(() => setState({ active: end }));
    };

    const setActive = active => setState({ active });

    const setContent = (index, newContent, noUpdate = false) => {
        index = Number(index);

        const { selection } = getSelection(state.id);
        const childSelection = _.flatten([selection, 0]);
        const content = Array.from(state.content);

        content.splice(index, 1, newContent);

        Transforms.delete(editor, { at: childSelection });
        Transforms.setNodes(editor, { content }, { at: selection });
        Transforms.insertNodes(editor, newContent, { at: childSelection });

        if (noUpdate !== true) setState({ content, active: index });

        return [content, index];
    };

    const setTabs = (tabs, index, noUpdate = false) => {
        index = index || state.active;

        const { selection } = getSelection(state.id);

        Transforms.setNodes(editor, { tabs }, { at: selection });

        if (noUpdate !== true) setState({ tabs });

        return [tabs, index];
    };

    const [handle] = useState({
        ...node,
        getSelection,
        reorder,
        setActive,
        setContent,
        setState,
        setTabs,
        state,
    });

    return (
        <div className={cx('element')} id={state.id} contentEditable={false}>
            {vertical === true ? (
                <Accordion {...handle}>
                    <TabContent {...handle} children={props.children} />
                </Accordion>
            ) : (
                <Tabs {...handle}>
                    <TabContent {...handle} children={props.children} />
                </Tabs>
            )}
        </div>
    );
};

const Accordion = ({ children }) => {
    return <div className='accordion'>{children}</div>;
};

export default Element;
