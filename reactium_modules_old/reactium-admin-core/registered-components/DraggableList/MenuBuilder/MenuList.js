import React, { useState, useEffect, useRef } from 'react';
import DraggableList from '../index';
import op from 'object-path';

const noop = () => {};
const DefaultMenuItemComponent = ({ item }) => (
    <div depth={item.depth} style={{ height: 50 }}>
        {item.id}
    </div>
);

const ItemWrapper = props => {
    const className = op.get(props, 'className', 'menu-item');
    const bind = op.get(props, 'bind');
    return (
        <div className={className}>
            {React.cloneElement(props.children, { bind })}
        </div>
    );
};

function immediateXDecorator(immediate) {
    return typeof immediate === 'function'
        ? n => n === 'x' || immediate(n)
        : n => n === 'x' || immediate;
}

const getImmediate = immediate => {
    if (immediate === immediateXDecorator) return immediate;
    return immediateXDecorator(immediate);
};

const MenuList = props => {
    const {
        items,
        defaultItemHeight,
        menuIndent,
        onReorder,
        onRemoveItem,
        onUpdateItem,
        fieldName,
        editor,
    } = props;
    const listRef = useRef();
    const indent = Math.max(10, menuIndent);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
    }, [items]);

    useEffect(() => {
        setLoading(false);
    }, [loading === true]);

    if (loading) return null;

    const tx = (index, dragContext, next) => {
        const { x, selected, originalIndex, items, state } = dragContext;

        const newIndex = items.findIndex(({ idx }) => index === idx);
        const depth = op.get(items, [newIndex, 'depth'], 0);
        const newX = depth * indent;
        next.x = newX;

        if (selected && index === originalIndex && newIndex > 0) {
            next.x = newX + x;
            next.immediate = getImmediate(next.immediate);
        }

        return next;
    };

    const txPH = (dragContext, next) => {
        const { down, newIndex, items, state } = dragContext;
        if (down) {
            const {
                movement: [x],
            } = state;
            const depthOffset = Math.floor(x / indent);
            const parentDepth = op.get(items, [newIndex - 1, 'depth'], 0);
            const nextX =
                Math.max(0, Math.min(parentDepth + 1, depthOffset)) * indent;

            next.x = nextX;
        }

        return next;
    };

    const onDrag = (state, tx, { items: newOrder }) => {
        const {
            args: [originalIndex],
            down,
            movement: [x],
        } = state;

        const curIndex = newOrder.findIndex(item => originalIndex === item.idx);
        const current = newOrder[curIndex];

        let depth = op.get(current, 'depth', 0);
        const parentDepth = op.get(newOrder, [curIndex - 1, 'depth'], 0);

        if (curIndex > 0) {
            const depthOffset = Math.floor(x / indent);
            depth = op.get(current, 'depth', parentDepth);
            depth = Math.max(0, Math.min(parentDepth + 1, depthOffset));
        } else {
            depth = 0;
        }

        if (!down) current.depth = depth;
    };

    return (
        <div>
            <DraggableList
                ref={listRef}
                defaultItemHeight={defaultItemHeight}
                onReorder={onReorder}
                onDrag={onDrag}
                dragTx={tx}
                dragTxPH={txPH}>
                {items.map(item => {
                    const MenuItem = op.get(
                        item,
                        'MenuItem',
                        DefaultMenuItemComponent,
                    );

                    return (
                        <ItemWrapper
                            className={props.itemClassName}
                            key={item.id}
                            depth={item.depth}
                            MenuItem={MenuItem}>
                            <MenuItem
                                key={item.id}
                                onRemoveItem={onRemoveItem}
                                onUpdateItem={onUpdateItem}
                                fieldName={fieldName}
                                editor={editor}
                                item={item}
                                listRef={listRef}
                            />
                        </ItemWrapper>
                    );
                })}
            </DraggableList>
        </div>
    );
};

MenuList.defaultProps = {
    items: [],
    defaultItemHeight: 50,
    dragSensitivity: 0.25,
    onReorder: noop,
    onRemoveItem: noop,
    onUpdateItem: noop,
    menuIndent: 20,
    itemClassName: 'menu-item',
};

export default MenuList;
