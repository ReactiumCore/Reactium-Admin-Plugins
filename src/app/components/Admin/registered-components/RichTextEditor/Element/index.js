import op from 'object-path';
import React, { forwardRef, useImperativeHandle } from 'react';
import ENUMS from '../enums';
const { LIST_TYPES } = ENUMS;

const Wrap = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => props);
    return props.children;
});

export default ({
    attributes,
    children,
    element,
    blocks = [],
    formats = [],
    ...editor
}) => {
    let output;

    const { type } = element;
    if (!type) return children;

    op.del(attributes, 'children');

    blocks.forEach(({ id, element: Element }) => {
        if (type !== id || output) return;
        const style = op.get(children, 'props.node.style', {});
        output = (
            <Wrap {...attributes}>
                <Element style={style}>{children}</Element>
            </Wrap>
        );
    });

    if (!output) {
        formats.forEach(({ id, element: Element }) => {
            if (type !== id || output) return;
            output = (
                <Wrap {...attributes}>
                    <Element {...element}>{children}</Element>
                </Wrap>
            );
        });
    }

    output = output || children;

    return output;
};
