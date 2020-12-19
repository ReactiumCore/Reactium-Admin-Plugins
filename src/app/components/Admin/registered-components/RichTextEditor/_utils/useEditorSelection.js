import _ from 'underscore';
import { useEditor } from 'slate-react';
import { useEffect, useState } from 'react';

export default (editor, nullable) => {
    // 1.0 - Editor reference
    editor = editor || useEditor();

    // 2.0 - Selection state
    const [selection, update] = useState();

    // 3.0 - setSelection()
    const setSelection = newSelection => {
        // 3.0.1 - Exit if no editor.selection value
        if (nullable !== true && !newSelection) return;

        // 3.0.2 - Exit if equal to current selection
        if (_.isEqual(selection, newSelection)) return;

        // 3.0.3 - Execute selection update
        update(newSelection);
    };

    // 4.0 - watch for editor.selection changes
    useEffect(() => setSelection(editor.selection), [editor.selection]);

    // 5.0 - Output the selection and setter
    return [selection, setSelection];
};
