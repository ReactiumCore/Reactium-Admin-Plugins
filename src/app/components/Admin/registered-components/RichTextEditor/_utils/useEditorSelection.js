import _ from 'underscore';
import { useEditor } from 'slate-react';
import { useEffect, useState } from 'react';

export default () => {
    const editor = useEditor();

    const [selection, updateSelection] = useState();

    const setSelection = newSelection => {
        if (!newSelection) return;
        if (_.isEqual(selection, newSelection)) return;
        updateSelection(newSelection);
    };

    useEffect(setSelection, [editor.selection]);

    return [selection, setSelection];
};
