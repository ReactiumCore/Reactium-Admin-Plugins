import _ from 'underscore';
import Reactium from 'reactium-core/sdk';
import { Path, Transforms } from 'slate';

export default (editor, entry, done) => {
    const [node, path] = entry;

    // Fix top level blocks to ensure there's a p after them
    if (path.length === 1 && node.type === 'block') {
        const next = Path.next(path);
        const sibling = editor.children[next[0]];
        if (sibling && sibling.type !== 'p') {
            Transforms.insertNodes(editor, Reactium.RTE.emptyNode, {
                at: next,
            });
        }
    }

    let last = _.last(editor.children);
    if ((last && last.type !== 'p') || editor.children.length < 1) {
        Transforms.insertNodes(editor, Reactium.RTE.emptyNode, {
            at: [editor.children.length],
        });
    }

    done(entry);
};
