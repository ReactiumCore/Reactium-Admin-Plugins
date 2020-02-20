import uuid from 'uuid/v4';
import op from 'object-path';
import React, { forwardRef, useImperativeHandle } from 'react';
import ENUMS from '../enums';
const { LIST_TYPES } = ENUMS;
import { useEditor } from 'slate-react';

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
    ...handle
}) => {
    let output;

    const editor = useEditor();

    const { type } = element;
    if (!type) return <Wrap {...attributes}>{children}</Wrap>;

    op.del(attributes, 'children');

    blocks.forEach(({ id, element: Element }) => {
        if (type !== id || output) return;
        const node = op.get(children, 'props.node');
        const ID = op.get(node, 'ID', uuid());
        const style = op.get(node, 'style', {});
        output = (
            <Wrap {...attributes}>
                <Element id={ID} style={style}>
                    {children}
                </Element>
            </Wrap>
        );
    });

    if (!output) {
        formats.forEach(({ id, element: Element }) => {
            if (type !== id || output) return;
            const node = op.get(children, 'props.node');
            const ID = op.get(node, 'ID', uuid());
            const style = op.get(node, 'style', {});

            output = (
                <Wrap {...attributes}>
                    <Element id={ID} style={style} {...element}>
                        {children}
                    </Element>
                </Wrap>
            );
        });
    }

    return output || <Wrap {...attributes}>{children}</Wrap>;
};
