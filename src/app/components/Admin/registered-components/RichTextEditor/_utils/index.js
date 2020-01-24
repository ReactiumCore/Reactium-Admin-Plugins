import _ from 'underscore';
import op from 'object-path';
import { Editor, Transforms, Text } from 'slate';
import React, { useEffect, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import Reactium, { useDerivedState } from 'reactium-core/sdk';
import useEditorBlocks from './useEditorBlocks';
import useEditorFormats from './useEditorFormats';
import useEditorPlugins from './useEditorPlugins';
import useEditorTypes from './useEditorTypes';
import useEventHandle from './useEventHandle';
import useSelectProps from './useSelectProps';

import ENUMS from '../enums';

const { LIST_TYPES } = ENUMS;

export {
    useEditorBlocks,
    useEditorFormats,
    useEditorPlugins,
    useEditorTypes,
    useEventHandle,
    useSelectProps,
};

export const getRange = (index = 0) => {
    try {
        return window.getSelection().getRangeAt(index);
    } catch (err) {}
};

export const getRect = () => {
    if (!getRange()) return;

    try {
        return getRange().getBoundingClientRect();
    } catch (err) {}
};

export const getSelected = () => {
    return !window.getSelection().isCollapsed;
};

export const insertNode = (editor, type, Insert) => {
    console.log(type, Insert);
    // const node = {
    //     type: 'paragraph',
    //     children: [
    //         {text: Insert()}
    //     ]
    // };
    //
    // Transforms.insertNodes(editor, node);
};

export const isBlockActive = (editor, block) => {
    const [match] = Editor.nodes(editor, {
        match: n => n.type === block,
    });

    return !!match;
};

export const isMarkActive = (editor, format) => {
    const marks = Editor.marks(editor) || {};
    return op.has(marks, format);
};

export const toggleBlock = (editor, block, e) => {
    if (e) e.preventDefault();

    const isActive = isBlockActive(editor, block);
    const isList = LIST_TYPES.includes(block);

    Transforms.unwrapNodes(editor, {
        match: n => LIST_TYPES.includes(n.type),
        split: true,
    });

    Transforms.setNodes(editor, {
        type: isActive ? 'p' : isList ? 'li' : block,
    });

    if (!isActive && isList) {
        const element = { type: block, children: [] };
        Transforms.wrapNodes(editor, element);
    }
};

export const toggleMark = (editor, format, e) => {
    if (e) e.preventDefault();

    const isActive = isMarkActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
};

export const useSelected = () => {
    if (typeof window === 'undefined') return {};

    const [state, setState] = useDerivedState({
        selected: getSelected(),
        range: getRange(),
        rect: getRect(),
        selection: window.getSelection(),
    });

    useEffect(() => {
        setState({
            selected: getSelected(),
            range: getRange(),
            rect: getRect(),
            selection: window.getSelection(),
        });
    }, [getRange(), getSelected()]);

    return state;
};
