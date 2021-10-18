import React from 'react';

const ListItem = ({ block, className, onClick = noop, ...props }) => {
    const { label, name } = block;
    const _onClick = () => onClick(block);
    return (
        <li className={className}>
            <button onClick={_onClick} {...props}>
                {label || name}
            </button>
        </li>
    );
};

export { ListItem as default, ListItem };
