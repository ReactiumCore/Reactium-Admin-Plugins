import React, {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
} from 'react';
import { useGesture } from 'react-use-gesture';
import { useSpring, useSprings, animated } from 'react-spring';
import uuid from 'uuid/v4';
import op from 'object-path';
import _ from 'underscore';
import cn from 'classnames';
import isHotkey from 'is-hotkey';
import { __, useAsyncEffect } from 'reactium-core/sdk';

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

const txFactory = props => dragContext => {
    const {
        items,
        selected,
        originalIndex,
        yOffset,
        init = true,
    } = dragContext;
    const dragScale = op.get(props, 'dragScale', 1.01);
    const dragShadow = op.get(props, 'dragShadow', 15);

    return index => {
        const newIndex = items.findIndex(({ idx }) => index === idx);

        let newStyle = {
            x: 0,
            y: op.get(items, [newIndex, 'y'], 0),
            scale: 1,
            zIndex: '0',
            shadow: 1,
            immediate: init,
        };

        if (selected !== false && index === selected) {
            newStyle = {
                x: 0,
                y: yOffset,
                scale: dragScale,
                zIndex: '1',
                shadow: dragShadow,
                immediate: n => n === 'y' || n === 'zIndex',
            };
        }

        if (typeof props.dragTx === 'function')
            newStyle = props.dragTx(index, dragContext, newStyle);

        return newStyle;
    };
};

const noop = () => {};
const DraggableList = forwardRef((props, ref) => {
    const { onReorder = noop, children } = props;
    const defaultItemHeight = op.get(props, 'defaultItemHeight', 100);
    const dragSensitivity = op.get(props, 'dragSensitivity', 0.125);
    const delegateBind = op.get(props, 'delegateBind', true);
    const tx = txFactory(props);
    const txPH = dragContext => {
        const { items, newIndex, down } = dragContext;

        let newStyle = {
            x: 0,
            y: 0,
            depth: 0,
            height: 0,
            opacity: 0,
            immediate: true,
        };

        if (down) {
            newStyle.y = op.get(items, [newIndex, 'y'], 0);
            newStyle.height = op.get(items, [newIndex, 'height'], 0);
            newStyle.opacity = 1;
        }

        if (typeof props.dragTxPH === 'function')
            newStyle = props.dragTxPH(dragContext, newStyle);

        return newStyle;
    };

    const itemsRef = useRef({ height: 0, items: {} });
    const getOrdered = items => {
        let h = 0;
        return items.map(
            (
                {
                    id,
                    height = defaultItemHeight,
                    depth = 0,
                    component,
                    ...item
                },
                idx,
            ) => {
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
                    depth,
                };

                return newItem;
            },
        );
    };

    const initItems = () =>
        getOrdered(
            mapIdx(
                React.Children.map(children, component => {
                    const props = op.get(component, 'props', {});
                    return {
                        ...props,
                        component,
                    };
                }),
            ),
        );

    const [orderedItems, _setOrderedItems] = useState(initItems());
    const orderedItemsRef = useRef(orderedItems);
    const setOrderedItems = items => {
        orderedItemsRef.current = items;
        _setOrderedItems(items);
    };

    const resize = items => {
        let y = 0;
        let total = 0;
        items.forEach((item, idx) => {
            if (op.has(itemsRef.current, ['items', item.id, 'el'])) {
                const el = itemsRef.current.items[item.id].el;
                const nodes = el.childNodes;

                let height = 0;
                for (let node of nodes) {
                    const nodeHeight =
                        node.offsetHeight || node.clientHeight || 0;
                    height += nodeHeight;
                }

                item.height = height;
                item.y = y;

                itemsRef.current.items[item.id].height = height;
                itemsRef.current.items[item.id].y = y;
                y += item.height;

                total += height;
            }
        });

        itemsRef.current.height = total;
        return total;
    };

    const updateOrderedItems = reorderedItems => {
        setOrderedItems(reorderedItems);
        if (typeof onReorder === 'function') {
            setTimeout(() => {
                resize(reorderedItems);
                onReorder(reorderedItems);
            }, 300);
        }
    };

    const [springs, setSprings] = useSprings(
        orderedItems.length,
        tx({ items: orderedItems }),
    );

    const springOrder = () =>
        springs.map((_, i) => {
            const itemIndex = orderedItemsRef.current.findIndex(
                item => item.idx === i,
            );
            return op.get(orderedItemsRef.current, itemIndex, {});
        });

    const animateResize = () => {
        let cpy = springOrder();
        const height = resize(cpy);
        cpy = getOrdered(cpy);
        setSprings(tx({ items: cpy, init: false }));
        setContainerSpring({ height, minHeight: height });
    };

    const changeHash = items =>
        items.map(({ id, depth }) => `${id}:${depth}`).join('');
    useAsyncEffect(
        async isMounted => {
            _.defer(() => {
                if (isMounted()) setOrderedItems(initItems());
            });
        },
        [changeHash(initItems())],
    );

    const bind = useGesture({
        onDrag: state => {
            const {
                args: [originalIndex],
                down,
                movement: [x, y],
            } = state;
            const cpy = [...orderedItems];
            const curIndex = cpy.findIndex(item => originalIndex === item.idx);

            const current = cpy[curIndex];

            const currentY = op.get(
                itemsRef.current,
                ['items', current.id, 'y'],
                current.y,
            );

            const yOffset = currentY + y;

            const [newIndex] = cpy.reduce(
                ([idx, total], item, i) => {
                    let offset = yOffset;
                    // moving up - portion of top before switch
                    if (y < 0) offset += current.height * dragSensitivity;
                    // moving down - portion of bottom before switch
                    else
                        offset +=
                            current.height - current.height * dragSensitivity;

                    if (offset > total) return [i, total + item.height];
                    return [idx, total];
                },
                [0, 0],
            );

            const curRow = clamp(newIndex, 0, cpy.length - 1);
            const newOrder = getOrdered(swap(cpy, curIndex, curRow));

            const dragContext = {
                items: newOrder,
                selected: down ? originalIndex : false,
                newIndex,
                originalIndex,
                x,
                yOffset,
                init: false,
                state,
            };

            if (typeof props.onDrag === 'function') {
                props.onDrag(state, tx(dragContext), dragContext);
            }

            setSprings(tx(dragContext));
            setPHSpring(txPH({ items: newOrder, newIndex, down, state }));

            if (!down) {
                updateOrderedItems(newOrder);
            }
        },
    });

    const _handle = () => ({
        tx,
        springs,
        setSprings,
        orderedItems,
        setOrderedItems,
        updateOrderedItems,
        animateResize,
        orderedItemsRef,
    });

    useImperativeHandle(ref, _handle, [changeHash(orderedItems)]);

    const containerStyle = items => {
        const minHeight = items.reduce((h, i) => h + i.height + 20, 0);
        return { height: minHeight, minHeight };
    };

    const [containerSpring, setContainerSpring] = useSpring(() =>
        containerStyle(orderedItems),
    );

    const [phSpring, setPHSpring] = useSpring(() => ({
        x: 0,
        y: 0,
        height: 0,
        opacity: 0,
        zIndex: 0,
        depth: 0,
    }));

    useAsyncEffect(
        async isMounted => {
            let changed = false;
            let cpy = [...orderedItems];

            resize(cpy);

            if (changed) {
                cpy = getOrdered(cpy);
                _.defer(() => {
                    if (isMounted()) {
                        setSprings(tx({ items: cpy }));
                        updateOrderedItems(cpy);
                    }
                });
            }
        },
        [children],
    );

    const onSpace = item => {
        const items = orderedItemsRef.current;
        const newItems = items.map(iObj => {
            if (item.id === iObj.id) {
                iObj.selected = !Boolean(iObj.selected);
                item.selected = iObj.selected;
                return iObj;
            }

            op.del(iObj, 'selected');
            return iObj;
        });

        if (!item.selected) {
            setSprings(
                tx({
                    items,
                    init: false,
                }),
            );

            updateOrderedItems(items);
        } else {
            setSprings(
                tx({
                    items: newItems,
                    selected: item.selected ? item.idx : false,
                    originalIndex: item.idx,
                    yOffset: item.y,
                    init: false,
                }),
            );

            setOrderedItems(items);
        }
    };

    const onUpArrow = (item, items) => {
        const currentIndex = items.findIndex(({ id }) => id === item.id);
        const newIndex = clamp(currentIndex - 1, 0, items.length - 1);
        const newOrder = getOrdered(swap(items, currentIndex, newIndex));
        const newItem = newOrder.find(iObj => iObj.id === item.id);

        const dragContext = {
            items: newOrder,
            selected: item.selected ? item.idx : false,
            originalIndex: item.idx,
            yOffset: newItem.y,
            init: false,
        };

        setSprings(tx(dragContext));

        setOrderedItems(newOrder);
    };

    const onDownArrow = (item, items) => {
        const currentIndex = items.findIndex(({ id }) => id === item.id);
        const newIndex = clamp(currentIndex + 1, 0, items.length - 1);
        const newOrder = getOrdered(swap(items, currentIndex, newIndex));
        const newItem = newOrder.find(iObj => iObj.id === item.id);

        const dragContext = {
            items: newOrder,
            selected: item.selected ? item.idx : false,
            originalIndex: item.idx,
            yOffset: newItem.y,
            init: false,
        };

        setSprings(tx(dragContext));

        setOrderedItems(newOrder);
    };

    const onKeyDown = item => e => {
        const items = springOrder();

        if (isHotkey('space', e)) {
            e.preventDefault();
            onSpace(item);
        }

        if (isHotkey('up', e)) {
            e.preventDefault();
            if (item.selected) {
                onUpArrow(item, items);
            }
        }

        if (isHotkey('down', e)) {
            e.preventDefault();
            if (item.selected) {
                onDownArrow(item, items);
            }
        }

        if (typeof props.onKeyDown === 'function') {
            props.onKeyDown(e, item, items, _handle());
        }
    };

    const addChildRef = item => el => {
        if (el) {
            op.set(itemsRef.current, ['items', item.id, 'el'], el);
        }
    };

    return (
        <animated.div className='drag-list-container' style={containerSpring}>
            <div className='drag-list' role='listbox'>
                <animated.div
                    key={'drag-list-placeholder'}
                    className='drag-list-placeholder'
                    style={{
                        position: 'absolute',
                        x: phSpring.x,
                        y: phSpring.y,
                        height: phSpring.height,
                        opacity: phSpring.opacity,
                        zIndex: phSpring.zIndex,
                    }}
                />

                {springs.map((spring, i) => {
                    const { zIndex, shadow, x, y, scale } = spring;
                    const itemIndex = orderedItems.findIndex(
                        item => item.idx === i,
                    );
                    const item = op.get(orderedItems, itemIndex, {});
                    const ariaActionLabel = `${item.id}-action-label`;
                    const delegatedBindables = i => ({
                        bind: {
                            ...bind(i),
                            onKeyDown: onKeyDown(item),
                            tabIndex: 0,
                            'aria-describedby': ariaActionLabel,
                        },
                    });

                    return (
                        <animated.div
                            key={item.id}
                            style={{
                                position: 'relative',
                                zIndex,
                                x,
                                y,
                                scale,
                            }}
                            children={
                                <div
                                    className={'drag-list-item'}
                                    style={{ height: item.height }}
                                    ref={addChildRef(item)}>
                                    <div
                                        className={cn('drag-list-item-inner', {
                                            first: i === 0,
                                            last: i === springs.length - 1,
                                        })}>
                                        <animated.div
                                            role='option'
                                            {...(!delegateBind
                                                ? delegatedBindables(i).bind
                                                : {})}>
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
                                            {delegateBind
                                                ? React.cloneElement(
                                                      item.component,
                                                      delegatedBindables(i),
                                                  )
                                                : item.component}
                                        </animated.div>
                                    </div>
                                </div>
                            }
                        />
                    );
                })}
            </div>
        </animated.div>
    );
});

DraggableList.defaultProps = {
    onReorder: noop,
    onDrag: noop,
    onKeyDown: noop,
    defaultItemHeight: 100,
    dragScale: 1.005,
    // fraction of item height needed to reorder
    dragSensitivity: 0.125,
    delegateBind: true,
};

export default DraggableList;
