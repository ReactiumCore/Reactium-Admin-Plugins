import _ from 'underscore';
import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Editor, Path, Transforms } from 'slate';
const Plugin = new RTEPlugin({ type: 'paste', order: 100 });

Plugin.callback = editor => {
    const { insertData } = editor;

    editor.insertData = data => {
        const text = data.getData('text/plain');

        let nodeData;
        try {
            nodeData = JSON.parse(text);
        } catch (err) {}

        if (_.isArray(nodeData) || _.isObject(nodeData)) {
            nodeData = Reactium.RTE.reassign(nodeData);

            const sel = editor.selection || editor.lastSelection || [0, 0];

            Transforms.select(editor, sel);

            const [parent, parentSel] = Editor.parent(editor, sel) || [];

            const isEmpty = Editor.isEmpty(editor, parent);

            const at = isEmpty === true ? parentSel : Path.next(parentSel);

            Transforms.insertNodes(editor, nodeData, { at });

            return;
        } else if (text) {
            let i = 0;
            for (const line of text.split('\n')) {
                if (!i) {
                    Transforms.insertText(editor, line);
                } else {
                    Transforms.insertNodes(editor, {
                        type: 'p',
                        children: [{ text: line }],
                    });
                }
                i++;
            }
            return;
        }

        insertData(data);
    };

    return editor;
};

export default Plugin;
