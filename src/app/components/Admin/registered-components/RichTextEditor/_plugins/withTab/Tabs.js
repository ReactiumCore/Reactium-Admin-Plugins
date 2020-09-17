import React from 'react';
import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Reactium, { useHookComponent, useRefs } from 'reactium-core/sdk';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Tab = ({ active, id, index, onBlur, onChange, onFocus, tab, refs }) => {
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const cname = cn('tab', { active: index === active });

    const isDragging = () =>
        Reactium.Cache.get('rteTabDrag') === `${id}-${index}`;
    const setDragging = val => {
        if (val === null || val === undefined || typeof val === 'undefined') {
            Reactium.Cache.del('rteTabDrag');
        } else {
            Reactium.Cache.set('rteTabDrag', `${id}-${val}`);
        }
    };

    return (
        <Draggable
            key={`tab-${index}`}
            draggableId={`tab-${index}`}
            index={index}>
            {(provided, snapshot) => {
                if (snapshot.isDragging && isDragging() !== true) {
                    setDragging(index);
                }

                if (!snapshot.isDragging && isDragging() === true) {
                    setDragging(null);
                    const target = refs.get(`tab.input.${index}`);
                    _.defer(() => onBlur({ target }));
                }

                return (
                    <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        tabIndex={-1}
                        onMouseUp={e => onFocus(e, index)}
                        className={cn(cname, {
                            dragging: snapshot.isDragging,
                        })}>
                        <Button appearance='circle'>
                            <Icon name='Feather.Plus' />
                        </Button>
                        <div className='handle' />
                        <input
                            type='text'
                            value={tab}
                            ref={elm => refs.set(`tab.input.${index}`, elm)}
                            onChange={e => onChange(e, index)}
                        />
                        <span className='placeholder'>
                            {provided.placeholder}
                        </span>
                        <Button appearance='circle' color='danger'>
                            <Icon name='Feather.X' />
                        </Button>
                    </div>
                );
            }}
        </Draggable>
    );
};

const Tabs = ({ children, id, reorder, state, setActive, setTabs }) => {
    const refs = useRefs();
    const _onChange = (e, index) => {
        const tabs = Array.from(state.tabs);
        tabs.splice(index, 1, e.target.value);

        setTabs(tabs, index);
    };

    const _onFocus = (e, active) => setActive(active);

    const _onBlur = e => {
        const inputs = Object.values(refs.get('tab.input'));
        inputs.forEach(input => {
            if (input === e.target) return;
            try {
                input.blur();
            } catch (err) {}
        });
    };

    const _onReorder = e => {
        const endIndex = op.get(e, 'destination.index');
        const startIndex = op.get(e, 'source.index');
        reorder(startIndex, endIndex);
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
                            {state.tabs.map((tab, i) => (
                                <Tab
                                    key={`${id}-tab-${i}`}
                                    id={id}
                                    active={state.active}
                                    onBlur={_onBlur}
                                    onChange={_onChange}
                                    onFocus={_onFocus}
                                    tab={tab}
                                    index={i}
                                    refs={refs}
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
