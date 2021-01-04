import _ from 'underscore';
import op from 'object-path';
import TabEditor from './TabEditor';
import TabContent from './TabContent';
import React, { useState } from 'react';
import { Editor, Transforms } from 'slate';
import VerticalTabs from './TabsVertical';
import HorizontalTabs from './TabsHorizontal';
import { ReactEditor, useEditor } from 'slate-react';
import Reactium, { __, useDerivedState, useRefs } from 'reactium-core/sdk';

const Element = props => {
    const refs = useRefs();
    const editor = useEditor();
    let node = op.get(props, 'children.props.node');

    const cx = Reactium.Utils.cxFactory('rte-tabs');

    const [state, setState] = useDerivedState({
        id: node.id,
        active: 0,
        content: node.content,
        expanded: true,
        tabs: Array.from(node.tabs),
        updated: null,
        vertical: node.vertical,
    });

    const addTab = ({ index }) => {
        const { selection } = getSelection(state.id);
        const content = Array.from(state.content);
        const tabs = Array.from(state.tabs);

        let count = tabs.length + 1;
        let title = String(__('Tab %count')).replace(/\%count/gi, count);

        // Duplicate title?
        while (tabs.includes(title)) {
            count += 1;
            title = String(__('Tab %count')).replace(/\%count/gi, count);
        }

        content.splice(index, 0, { children: [{ text: '' }], type: 'empty' });
        tabs.splice(index, 0, title);

        // Update RTE
        Transforms.setNodes(editor, { content, tabs }, { at: selection });

        setState({ content, tabs });
        return new Promise(resolve =>
            _.defer(() => {
                setActive(index);
                resolve({ tabs, content });
            }),
        );
    };

    const deleteTab = ({ index }) => {
        const { selection } = getSelection(state.id);
        const content = Array.from(state.content);
        const tabs = Array.from(state.tabs);

        if (tabs.length === 1) {
            // Delete the entire node from the RTE
            Transforms.delete(editor, { at: selection });
            ReactEditor.focus(editor);
        } else {
            content.splice(index, 1);
            tabs.splice(index, 1);

            const active = Math.min(index, tabs.length - 1);
            const newState = { active, content, tabs };
            const cont = content[active];

            setState(newState);

            // Update RTE again with the newly active tab
            return new Promise(resolve => {
                _.defer(() => {
                    setTabs(tabs, active, false);
                    setContent(active, cont, false);
                    resolve();
                });
            });
        }
    };

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

        _.defer(() =>
            setState({ active: end, updated: Date.now(), expanded: false }),
        );
    };

    const setActive = active =>
        setState({ active, updated: Date.now(), expanded: true });

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

    const showEditor = () => {
        const tabEditor = refs.get('editor');
        tabEditor.show();
    };

    const toggleVertical = () => setState({ vertical: !state.vertical });

    const [handle] = useState({
        ...node,
        addTab,
        deleteTab,
        editor,
        getSelection,
        reorder,
        setActive,
        setContent,
        setState,
        setTabs,
        showEditor,
        state,
        toggleVertical,
    });

    return (
        <div
            id={state.id}
            contentEditable={false}
            className={cx('element')}
            style={{ userSelect: 'none' }}>
            <Tabs
                {...handle}
                children={<TabContent {...handle} children={props.children} />}
            />
            <TabEditor {...handle} ref={elm => refs.set('editor', elm)} />
        </div>
    );
};

const Tabs = props => {
    return props.state.vertical === true ? (
        <VerticalTabs {...props} />
    ) : (
        <HorizontalTabs {...props} />
    );
};

export default Element;
