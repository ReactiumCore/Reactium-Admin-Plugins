import { Transforms } from 'slate';
import RTEPlugin from '../RTEPlugin';
const Plugin = new RTEPlugin({ type: 'paste', order: 100 });

Plugin.callback = editor => {
    const { insertData } = editor;

    editor.insertData = data => {
        const text = data.getData('text/plain');
        if (text) {
            let i = 0;
            for (const line of text.split('\n')) {
                if (!i) {
                    Transforms.insertText(editor, line);
                } else {
                    Transforms.insertNodes(editor, {
                        type: 'paragraph',
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
