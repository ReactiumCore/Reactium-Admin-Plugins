import op from 'object-path';
import React, { forwardRef, useImperativeHandle } from 'react';
import ENUMS from '../enums';
const { LIST_TYPES } = ENUMS;

const Wrap = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => props);
    return props.children;
});

export default ({ attributes, children, element, blocks = {} }) => {
    let output;
    const { type } = element;
    if (!type) return children;

    op.del(attributes, 'children');

    Object.entries(blocks).forEach(([key, { block: Block }]) => {
        if (type !== key || output) return;
        output = (
            <Wrap {...attributes}>
                <Block>{children}</Block>
            </Wrap>
        );
    });

    output = output || <p {...attributes}>{children}</p>;

    return output;
};
