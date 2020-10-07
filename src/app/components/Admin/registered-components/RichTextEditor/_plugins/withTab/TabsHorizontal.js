import Tab from './Tab';
import React from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { __, useHookComponent, useRefs } from 'reactium-core/sdk';

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

export { TabsHorizontal, TabsHorizontal as default };
