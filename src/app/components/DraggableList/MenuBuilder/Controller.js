import React, { useState } from 'react';
import MenuList from './MenuList';
import _ from 'underscore';
import op from 'object-path';

const MenuController = () => {
    const [items, setItems] = useState([]);

    const addItem = () => {
        setItems(
            items.concat({
                id: items.length,
                type: 'something',
                depth: items.length,
            }),
        );
    };

    const onReorder = reordered => {
        const currentItemsById = _.indexBy(items, 'id');
        const newItems = _.compact(
            reordered.map(({ key, depth = 0 }) => ({
                ...currentItemsById[key],
                depth,
            })),
        ).map((item, idx, items) => ({
            ...item,
            depth: Math.min(
                op.get(items, [idx - 1, 'depth'], 0) + 1,
                item.depth,
            ),
        }));

        if (
            items.length !== newItems.length ||
            !_.isEqual(_.pluck(items, 'id'), _.pluck(newItems, 'id')) ||
            !_.isEqual(_.pluck(items, 'depth'), _.pluck(newItems, 'depth'))
        ) {
            setItems(newItems);
        }
    };

    return (
        <div className='row p-xs-20'>
            <div className='col-xs-6'>
                <MenuList items={items} onReorder={onReorder} />
            </div>
            <div className='col-xs-6 p-xs-20'>
                <button onClick={addItem}>Add Item</button>
            </div>
        </div>
    );
};

export default MenuController;
