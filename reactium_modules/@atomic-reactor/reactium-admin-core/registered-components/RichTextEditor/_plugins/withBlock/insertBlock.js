import uuid from 'uuid/v4';
import op from 'object-path';
import { Transforms } from 'slate';

const insertBlock = (editor, props) => {
    const id = op.get(props, 'id') || `block-${uuid()}`;
    const blocked = op.get(props, 'blocked', true);

    Transforms.wrapNodes(
        editor,
        {
            blocked,
            id,
            type: 'block',
            className: 'full',
        },
        { split: true },
    );
};

export { insertBlock, insertBlock as default };
