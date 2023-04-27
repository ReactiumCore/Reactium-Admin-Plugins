import uuid from 'uuid/v4';
import op from 'object-path';

const blockNode = props => {
    const id = op.get(props, 'id') || `block-${uuid()}`;
    const blocked = op.get(props, 'blocked', true);
    const children = [
        {
            type: 'div',
            children: op.get(props, 'children', [{ text: '' }]),
        },
    ];

    return [
        {
            ...props,
            blocked,
            children,
            id,
            type: 'block',
        },
    ];
};

export { blockNode, blockNode as default };
