import React from 'react';
import op from 'object-path';
import { Editor } from 'slate';

const Leaf = ({ attributes, children, formats = [], leaf }) => {
    formats.forEach(({ id, element: Element }) => {
        if (!op.get(leaf, id)) return;
        children = <Element>{children}</Element>;
    });

    return <span {...attributes}>{children}</span>;
};

export default Leaf;
