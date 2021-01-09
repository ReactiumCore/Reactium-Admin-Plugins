import React from 'react';
import _ from 'underscore';
import { __ } from 'reactium-core/sdk';
import { Scrollbars } from 'react-custom-scrollbars';

const noop = () => {};

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

const List = ({
    blocks = [],
    children,
    cx = noop,
    onClick = noop,
    onSearch = noop,
}) => (
    <div className={cx('list')}>
        <div className={cx('search')}>
            <div className='form-group'>
                <input
                    data-focus
                    type='search'
                    placeholder={__('search')}
                    className='grow'
                    onFocus={e => e.target.select()}
                    onChange={onSearch}
                />
            </div>
        </div>
        <Scrollbars autoHeight autoHeightMin={324} autoHeightMax='80vh'>
            <ul>
                {_.sortBy(blocks, 'label').map((block, i) => (
                    <ListItem
                        block={block}
                        className={cx('list-item')}
                        key={`block-list-item-${i}`}
                        onClick={onClick}
                    />
                ))}
            </ul>
            {children}
        </Scrollbars>
    </div>
);

export { List as default, List, ListItem };
