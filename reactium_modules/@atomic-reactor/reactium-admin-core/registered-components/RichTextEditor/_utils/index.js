import ENUMS from '../enums';
import op from 'object-path';
import { useEffect } from 'react';
import { Editor, Transforms } from 'slate';
import useSelectProps from './useSelectProps';
import useEditorPlugins from './useEditorPlugins';
import useRegistryFilter from './useRegistryFilter';
import { useDerivedState } from 'reactium-core/sdk';
import useEditorSelection from './useEditorSelection';

const { LIST_TYPES } = ENUMS;

export {
    useEditorPlugins,
    useEditorSelection,
    useRegistryFilter,
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

/**
 * @api {Function} isBlockActive(editor,block) isBlockActive()
 * @apiGroup Reactium.RTE
 * @apiName isBlockActive
 * @apiDescription Determines if the block is active within the specified editor.
 * @apiParam {Editor} editor Reference to a Slate Editor object.
 * @apiParam {String} block The id of the block.
 */
export const isBlockActive = (editor, block) => {
    if (!editor) return false;
    if (!block) return false;

    try {
        const [match] = Editor.nodes(editor, {
            match: n => n.type === block,
        });

        return !!match;
    } catch (err) {}
};

/**
 * @api {Function} isMarkActive(editor,block) isMarkActive()
 * @apiGroup Reactium.RTE
 * @apiName isMarkActive
 * @apiDescription Determines if the mark is active within the specified editor.
 * @apiParam {Editor} editor Reference to a Slate Editor object.
 * @apiParam {String} block The id of the mark.
 */
export const isMarkActive = (editor, format) => {
    if (!editor) return false;
    if (!format) return false;

    try {
        const marks = Editor.marks(editor) || {};
        return op.has(marks, format);
    } catch (err) {
        return false;
    }
};

/**
 * @api {Function} toggleBlock(editor,block,event) toggleBlock()
 * @apiGroup Reactium.RTE
 * @apiName toggleBlock
 * @apiDescription Toggles a block within the specified editor.
 * @apiParam {Editor} editor Reference to a Slate Editor object.
 * @apiParam {String} block The id of the mark.
 * @apiParam {MouseEvent} [event] Used when clicking a toolbar/sidebar button to prevent default behavior so that the editor does not lose focus.
 */
export const toggleBlock = (editor, block, e) => {
    if (e) {
        e.preventDefault();
    }

    const isActive = isBlockActive(editor, block);
    const isList = LIST_TYPES.includes(block);

    Transforms.unwrapNodes(editor, {
        match: n => LIST_TYPES.includes(n.type),
        split: true,
    });

    if (isList) {
        Transforms.setNodes(editor, {
            type: isActive ? 'div' : 'li',
        });
    } else {
        Transforms.setNodes(editor, {
            type: isActive ? 'div' : block,
        });
    }

    if (!isActive && isList) {
        const element = { type: block, children: [] };
        Transforms.wrapNodes(editor, element);
    }
};

/**
 * @api {Function} toggleMark(editor,block,event) toggleMark()
 * @apiGroup Reactium.RTE
 * @apiName toggleMark
 * @apiDescription Toggles a mark (inline format) within the specified editor.
 * @apiParam {Editor} editor Reference to a Slate Editor object.
 * @apiParam {String} block The id of the mark.
 * @apiParam {MouseEvent} [event] Used when clicking a toolbar/sidebar button to prevent default behavior so that the editor does not lose focus.
 */
export const toggleMark = (editor, format, e) => {
    if (op.has(e, 'preventDefault')) e.preventDefault();

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
