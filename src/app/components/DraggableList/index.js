import React, {
    useState,
    useRef,
    useEffect,
    useLayoutEffect as useWindowEffect,
} from 'react';
import { useGesture } from 'react-use-gesture';
import { useSprings, animated } from 'react-spring';
import uuid from 'uuid/v4';
import op from 'object-path';
import _ from 'underscore';
import cn from 'classnames';
import isHotkey from 'is-hotkey';
import Reactium, { __ } from 'reactium-core/sdk';

// Server-Side Render safe useLayoutEffect (useEffect when node)
const useLayoutEffect =
    typeof window !== 'undefined' ? useWindowEffect : useEffect;

const clamp = (number, lower, upper) => {
    if (number !== undefined) {
        number = Math.min(number, upper);
        number = Math.max(number, lower);
    }

    return number;
};

const swap = (array, from, to) => {
    const cpy = [...array];
    const item = array[from];

    cpy.splice(from, 1);
    cpy.splice(to, 0, item);

    return cpy;
};

const mapIdx = (items = []) =>
    items.map((item = {}, idx) => ({
        ...item,
        idx,
    }));

const fn = (orderedItems, down, originalIndex, y, yOffset) => {
    return index => {
        const newIndex = orderedItems.findIndex(({ idx }) => index === idx);
        if (index === 1)
            console.log({ originalIndex, index, newIndex, y, yOffset });
        let newStyle = {
            y: op.get(orderedItems, [newIndex, 'y'], 0),
            scale: 1,
            zIndex: '0',
            shadow: 1,
            immediate: false,
        };

        if (down && index === originalIndex) {
            newStyle = {
                y: yOffset,
                scale: 1.04,
                zIndex: '1',
                shadow: 15,
                immediate: n => n === 'y' || n === 'zIndex',
            };
        }

        return newStyle;
    };
};

const noop = () => {};
const DraggableList = props => {
    const { onReorder = noop, children } = props;
    const itemsRef = useRef({});
    const getOrdered = items => {
        let h = 0;
        return items.map(({ id, height = 100, component, ...item }, idx) => {
            h += height;
            const componentProps = { ...component };
            if (!id)
                id =
                    op.get(
                        componentProps,
                        'key',
                        op.get(componentProps, 'id', id),
                    ) || uuid();

            const newItem = {
                ...component,
                ...item,
                component,
                id,
                height,
                y: h - height,
            };

            return newItem;
        });
    };

    const [orderedItems, setOrderedItems] = useState(
        getOrdered(
            mapIdx(
                React.Children.map(children, component => ({
                    component,
                })),
            ),
        ),
    );

    const updateOrderedItems = items => {
        setOrderedItems(items);
        if (typeof onReorder === 'function') onReorder(items);
    };

    const [springs, setSprings] = useSprings(
        orderedItems.length,
        fn(orderedItems),
    );

    const bind = useGesture({
        onDrag: state => {
            const {
                args: [originalIndex],
                down,
                movement: [, y],
            } = state;
            const curIndex = orderedItems.findIndex(
                item => originalIndex === item.idx,
            );
            const current = orderedItems[curIndex];
            const yOffset = current.y + y;

            const [newIndex] = orderedItems.reduce(
                ([idx, total], item, i) => {
                    let offset = yOffset;
                    // moving up - portion of top before switch
                    if (y < 0) offset += current.height / 8;
                    // moving down - portion of bottom before switch
                    else offset += current.height - current.height / 8;

                    if (offset > total) return [i, total + item.height];
                    return [idx, total];
                },
                [0, 0],
            );

            const curRow = clamp(newIndex, 0, orderedItems.length - 1);
            const newOrder = getOrdered(swap(orderedItems, curIndex, curRow));

            setSprings(fn(newOrder, down, originalIndex, y, yOffset));

            if (!down) updateOrderedItems(newOrder);

            if (typeof props.onDrag === 'function') props.onDrag(state);
        },
    });

    const containerStyle = () => {
        const minHeight = orderedItems.reduce((h, i) => h + i.height, 0);

        return { height: minHeight, minHeight };
    };

    useLayoutEffect(() => {
        let changed = false;
        let cpy = [...orderedItems];
        orderedItems.forEach((item, idx) => {
            if (op.has(itemsRef.current, [item.id])) {
                const el = itemsRef.current[item.id];
                const nodes = el.childNodes;

                let height = 0;
                for (let node of nodes) {
                    const nodeHeight =
                        node.offsetHeight || node.clientHeight || 0;
                    height += nodeHeight;
                }

                if (height !== cpy[idx].height) {
                    changed = true;
                    cpy[idx].height = height;
                }
            }
        });

        if (changed) {
            cpy = getOrdered(cpy);
            _.defer(() => {
                setSprings(fn(cpy));
                updateOrderedItems(cpy);
            });
        }
    }, [children]);

    const onSpace = item => {
        const newItems = orderedItems.map(iObj => {
            if (item.id === iObj.id) {
                iObj.down = !Boolean(iObj.down);
                return iObj;
            }

            op.del(iObj, 'down');
            return iObj;
        });

        setSprings(fn(orderedItems, item.down, item.idx, 0, item.y));

        if (!item.down) updateOrderedItems(newItems);
    };

    const onUpArrow = item => {
        const currentIndex = orderedItems.findIndex(({ id }) => id === item.id);
        const newIndex = clamp(currentIndex - 1, 0, orderedItems.length - 1);
        const newOrder = getOrdered(swap(orderedItems, currentIndex, newIndex));
        const newItem = newOrder.find(iObj => iObj.id === item.id);

        setSprings(fn(newOrder, item.down, item.idx, 0, newItem.y));
        setOrderedItems(newOrder);
    };

    const onDownArrow = item => {
        const currentIndex = orderedItems.findIndex(({ id }) => id === item.id);
        const newIndex = clamp(currentIndex + 1, 0, orderedItems.length - 1);
        const newOrder = getOrdered(swap(orderedItems, currentIndex, newIndex));
        const newItem = newOrder.find(iObj => iObj.id === item.id);

        setSprings(fn(newOrder, item.down, item.idx, 0, newItem.y));
        setOrderedItems(newOrder);
    };

    const onKeyDown = item => e => {
        const currentIndex = orderedItems.findIndex(({ id }) => id === item.id);

        if (isHotkey('space', e)) {
            e.preventDefault();
            onSpace(item);
        }

        if (isHotkey('up', e)) {
            e.preventDefault();
            if (item.down) {
                onUpArrow(item, currentIndex);
            }
        }

        if (isHotkey('down', e)) {
            e.preventDefault();
            if (item.down) {
                onDownArrow(item, currentIndex);
            }
        }

        if (typeof props.onKeyDown === 'function') {
            props.onKeyDown(e);
        }
    };

    return (
        <div className='drag-list-container' style={containerStyle()}>
            <div className='drag-list' role='listbox'>
                {springs.map(({ zIndex, shadow, y, scale }, i) => {
                    const itemIndex = orderedItems.findIndex(
                        item => item.idx === i,
                    );
                    const item = op.get(orderedItems, itemIndex, {});
                    const ariaActionLabel = `${item.id}-action-label`;
                    return (
                        <animated.div
                            key={item.id}
                            style={{
                                position: 'relative',
                                zIndex,
                                y,
                                scale,
                            }}
                            children={
                                <div
                                    className={'drag-list-item'}
                                    style={{ height: item.height }}
                                    ref={el =>
                                        op.set(itemsRef.current, [item.id], el)
                                    }>
                                    <div
                                        className={cn('drag-list-item-inner', {
                                            first: i === 0,
                                            last: i === springs.length - 1,
                                        })}>
                                        <animated.div
                                            role='option'
                                            {...bind(i)}
                                            onKeyDown={onKeyDown(item)}
                                            tabIndex={0}
                                            aria-describedby={ariaActionLabel}
                                            style={{
                                                boxShadow: shadow.to(
                                                    s =>
                                                        `rgba(0, 0, 0, 0.5) 0px ${1.1 *
                                                            s}px ${2 *
                                                            s}px 0px`,
                                                ),
                                            }}>
                                            <span
                                                id={ariaActionLabel}
                                                className='sr-only'>
                                                {__(
                                                    'Press spacebar to reorder. Currently at %place',
                                                ).replace(
                                                    '%place',
                                                    itemIndex + 1,
                                                )}
                                            </span>
                                            {item.component}
                                        </animated.div>
                                    </div>
                                </div>
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
};

DraggableList.defaultProps = {
    onReorder: noop,
    onDrag: noop,
    onKeyDown: noop,
};

export default DraggableList;
