import React from 'react';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import { useHookComponent, useRefs } from 'reactium-core/sdk';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Tab = ({
    active,
    addTab,
    deleteTab,
    index,
    onChange,
    onFocus,
    tab,
    refs,
}) => {
    const cname = cn('tab', { active: index === active });
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return (
        <Draggable
            key={`tab-${index}`}
            draggableId={`tab-${index}`}
            index={index}>
            {(provided, snapshot) => {
                const _onMouseDown = provided.dragHandleProps.onMouseDown;
                const className = cn(cname, { dragging: snapshot.isDragging });

                provided.dragHandleProps.onMouseDown = e => {
                    const input = refs.get(`tab.input.${index}`);
                    onFocus({ index, target: input });
                    _onMouseDown(e);
                };

                return (
                    <div
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        tabIndex={-1}
                        className={className}>
                        <Button
                            appearance='circle'
                            color='danger'
                            onClick={e => deleteTab({ ...e, index })}>
                            <Icon name='Feather.X' />
                        </Button>
                        <div
                            className='handle'
                            {...provided.dragHandleProps}
                            tabIndex={-1}
                        />
                        <input
                            type='text'
                            value={tab}
                            ref={elm => refs.set(`tab.input.${index}`, elm)}
                            onChange={e => onChange(e, index)}
                            onFocus={e => onFocus({ index, target: e.target })}
                        />
                        <Button
                            appearance='circle'
                            onClick={e => addTab({ ...e, index: index + 1 })}>
                            <Icon name='Feather.Plus' />
                        </Button>
                    </div>
                );
            }}
        </Draggable>
    );
};

const Tabs = ({ children, ...props }) => {
    const refs = useRefs();
    const { state } = props;
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const _onChange = (e, index) => {
        const tabs = Array.from(state.tabs);
        tabs.splice(index, 1, e.target.value);
        props.setTabs(tabs, index);
    };

    const _onFocus = ({ index, target }) => {
        const inputs = Object.values(refs.get('tab.input'));
        inputs.forEach(input => {
            if (input === target) return;
            try {
                input.blur();
            } catch (err) {}
        });
        props.setActive(index);
    };

    const _onReorder = e => {
        const endIndex = op.get(e, 'destination.index');
        const startIndex = op.get(e, 'source.index');
        props.reorder(startIndex, endIndex);
    };

    return (
        <>
            <DragDropContext onDragEnd={_onReorder}>
                <Droppable droppableId={uuid()} direction='horizontal'>
                    {(provided, snapshot) => (
                        <div
                            tabIndex={-1}
                            {...provided.droppableProps}
                            className={cn('tabs', {
                                droppable:
                                    snapshot.isDraggingOver ||
                                    snapshot.draggingFromThisWith,
                            })}
                            ref={provided.innerRef}>
                            <div className='actions'>
                                <Button
                                    color='clear'
                                    onClick={() => props.toggleVertical()}>
                                    <Icon name='Feather.MoreVertical' />
                                </Button>
                                <Button
                                    color='clear'
                                    className='addBtn'
                                    onClick={() => props.addTab({ index: 0 })}>
                                    <Icon name='Feather.Plus' />
                                </Button>
                            </div>
                            {state.tabs.map((tab, i) => (
                                <Tab
                                    {...props}
                                    key={`${props.id}-tab-${i}`}
                                    active={state.active}
                                    onChange={_onChange}
                                    onFocus={_onFocus}
                                    refs={refs}
                                    tab={tab}
                                    index={i}
                                />
                            ))}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <div className='tabs-content'>
                <div className='container'>{children}</div>
            </div>
        </>
    );
};

export { Tab, Tabs, Tabs as default };
