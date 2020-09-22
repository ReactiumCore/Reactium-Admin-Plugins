import React, { useEffect, useState } from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import { __, useHookComponent, useRefs } from 'reactium-core/sdk';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const Tab = ({
    active,
    addTab,
    deleteTab,
    index,
    onChange,
    onEnter,
    onFocus,
    state,
    tab,
    refs,
    ...props
}) => {
    const cname = cn('tab', { active: index === active });
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const [expanded, setExpanded] = useState(state.active === index);

    useEffect(() => {
        setExpanded(state.active === index);
    }, [state.active]);

    return (
        <Draggable
            key={`tab-${index}`}
            draggableId={`tab-${index}`}
            index={index}>
            {(provided, snapshot) => {
                const _onMouseDown = provided.dragHandleProps.onMouseDown;
                const _onMouseUp = provided.dragHandleProps.onMouseUp;
                const className = cn(cname, { dragging: snapshot.isDragging });

                provided.dragHandleProps.onMouseDown = e => {
                    setExpanded(false);
                    _onMouseDown(e);
                };

                provided.dragHandleProps.onMouseUp = e => {
                    const input = refs.get(`tab.input.${index}`);
                    onFocus({ index, target: input, active: true });
                    setExpanded(true);
                    _onMouseUp(e);
                };

                return (
                    <div
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        tabIndex={-1}
                        className={className}>
                        <div
                            className='handle'
                            {...provided.dragHandleProps}
                            tabIndex={-1}
                        />
                        <input
                            type='text'
                            value={tab}
                            ref={elm => refs.set(`tab.input.${index}`, elm)}
                            onKeyDown={e => onEnter(e, index)}
                            onChange={e => onChange(e, index)}
                            onFocus={e =>
                                onFocus({
                                    index,
                                    target: e.target,
                                    active: true,
                                })
                            }
                        />
                        {expanded === null || expanded === true
                            ? props.children
                            : null}
                        <Button
                            appearance='circle'
                            color='danger'
                            children={<Icon name='Feather.X' />}
                            className={cn('delete', {
                                left: !state.vertical,
                            })}
                            onClick={e => deleteTab({ ...e, index })}
                        />
                        {state.vertical && (
                            <Button
                                appearance='circle'
                                children={<Icon name='Feather.Plus' />}
                                className='top'
                                onClick={e => addTab({ ...e, index: index })}
                            />
                        )}
                        <Button
                            appearance='circle'
                            children={<Icon name='Feather.Plus' />}
                            className={state.vertical ? 'bottom' : 'right'}
                            onClick={e => addTab({ ...e, index: index + 1 })}
                        />
                    </div>
                );
            }}
        </Draggable>
    );
};

const TabsHorizontal = ({ children, ...props }) => {
    const refs = useRefs();
    const { state } = props;
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const _onChange = (e, index) => {
        const tabs = Array.from(state.tabs);
        tabs.splice(index, 1, e.target.value);
        props.setTabs(tabs, index);
    };

    const _onEnter = (e, index) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            const next = index + 1;
            if (next === state.tabs.length) return;
            const input = refs.get(`tab.input.${next}`);
            if (input) _.defer(() => input.focus());
        }
    };

    const _onFocus = ({ active, index, target }) => {
        const inputs = Object.values(refs.get('tab.input'));
        inputs.forEach(input => {
            if (input === target) return;
            try {
                input.blur();
            } catch (err) {}
        });
        if (active !== false) props.setActive(index);
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
                            key={`${props.id}-tab-horizontal`}
                            {...provided.droppableProps}
                            className={cn('tabs', {
                                droppable:
                                    snapshot.isDraggingOver ||
                                    snapshot.draggingFromThisWith,
                            })}
                            ref={provided.innerRef}>
                            {state.tabs.map((tab, i) => (
                                <Tab
                                    {...props}
                                    key={`${props.id}-tab-h-${i}`}
                                    active={state.active}
                                    onChange={_onChange}
                                    onEnter={_onEnter}
                                    onFocus={_onFocus}
                                    refs={refs}
                                    tab={tab}
                                    index={i}
                                />
                            ))}
                            <div className='spacer' />
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <div className='tabs-actions'>
                <Button
                    color='clear'
                    data-align='right'
                    data-vertical-align='middle'
                    data-tooltip={__('Toggle direction')}
                    onClick={() => props.toggleVertical()}
                    children={<Icon name='Feather.MoreVertical' />}
                />
                <Button
                    color='clear'
                    className='addBtn'
                    data-align='right'
                    data-vertical-align='middle'
                    data-tooltip={__('Add tab')}
                    onClick={() => props.addTab({ index: 0 })}
                    children={<Icon name='Feather.Plus' />}
                />
            </div>
            <div className='tabs-content'>
                <div className='container'>{children}</div>
            </div>
        </>
    );
};

export { Tab, TabsHorizontal, TabsHorizontal as default };
