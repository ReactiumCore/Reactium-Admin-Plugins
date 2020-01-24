import React from 'react';
import op from 'object-path';
import { Editor } from 'slate';

const Leaf = ({ attributes, children, formats = {}, leaf }) => {
    Object.entries(formats).forEach(([key, { leaf: Element }]) => {
        if (!op.get(leaf, key)) return;
        children = <Element>{children}</Element>;
    });

    return <span {...attributes}>{children}</span>;
};

export default Leaf;
