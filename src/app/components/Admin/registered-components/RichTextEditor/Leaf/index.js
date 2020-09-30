import React from 'react';
import op from 'object-path';
import { Editor } from 'slate';

const Leaf = props => {
    let { attributes, children, formats = [], leaf = {} } = props;

    formats.forEach(({ id, element: Element }) => {
        if (!op.get(leaf, id)) return;
        children = <Element>{children}</Element>;
    });

    return (
        <span {...attributes} {...leaf}>
            {children}
        </span>
    );
};

export default Leaf;
