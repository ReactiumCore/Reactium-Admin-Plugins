import RTEPlugin from '../RTEPlugin';
import Reactium from 'reactium-core/sdk';
import { Editor, Path, Transforms } from 'slate';
const Plugin = new RTEPlugin({ type: 'paste', order: 100 });

Plugin.callback = editor => {
    const { insertData } = editor;

    editor.insertData = data => {
        const text = data.getData('text/plain');

        let isBlock, nodeData;

        try {
            nodeData = JSON.parse(text);
            isBlock = Editor.isBlock(editor, nodeData);
        } catch (err) {
            isBlock = false;
        }

        if (isBlock) {
            nodeData = Reactium.RTE.reassign(nodeData);

            const sel = Editor.path(editor, editor.selection);

            Transforms.insertNodes(editor, nodeData, { at: Path.parent(sel) });

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
