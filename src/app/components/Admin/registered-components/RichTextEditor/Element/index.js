import op from 'object-path';
import React, { forwardRef, useImperativeHandle } from 'react';
import ENUMS from '../enums';
const { LIST_TYPES } = ENUMS;

const Wrap = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => props);
    return props.children;
});

export default ({ attributes, children, element, blocks = [] }) => {
    let output;
    const { type } = element;
    if (!type) return children;

    op.del(attributes, 'children');

    blocks.forEach(({ id, element: Element }) => {
        if (type !== id || output) return;
        output = (
            <Wrap {...attributes}>
                <Element>{children}</Element>
            </Wrap>
        );
    });

    output = output || <p {...attributes}>{children}</p>;

    return output;
};
