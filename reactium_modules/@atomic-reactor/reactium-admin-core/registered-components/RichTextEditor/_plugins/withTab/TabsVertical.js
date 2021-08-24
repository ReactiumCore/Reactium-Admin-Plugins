import Tab from './Tab';
import React from 'react';
import _ from 'underscore';
import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { __, useHookComponent, useRefs } from 'reactium-core/sdk';

const TabsVertical = ({ children, ...props }) => {
    const refs = useRefs();
    const { state, setState } = props;
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

    const _onFocus = ({ index }) => props.setActive(index);

    const _onDrag = () => setState({ expanded: false });

    const _onDrop = e => {
        const { index } = e;
        const evt = { index, active: true };
        _onFocus(evt);
    };

    const _onReorder = e => {
        const endIndex = op.get(e, 'destination.index');
        const startIndex = op.get(e, 'source.index');
        props.reorder(startIndex, endIndex);
    };

    return (
        <>
            <DragDropContext onDragEnd={_onReorder}>
                <Droppable droppableId={uuid()} direction='vertical'>
                    {(provided, snapshot) => (
                        <div
                            tabIndex={-1}
                            key={`${props.id}-tab-vertical`}
                            {...provided.droppableProps}
                            className={cn('accordion', {
                                droppable:
                                    snapshot.isDraggingOver ||
                                    snapshot.draggingFromThisWith,
                            })}
                            ref={provided.innerRef}>
                            {state.tabs.map((tab, i) => (
                                <Tab
                                    {...props}
                                    key={`${props.id}-tab-v-${i}`}
                                    active={state.active}
                                    onChange={_onChange}
                                    onDrop={_onDrop}
                                    onDrag={_onDrag}
                                    onEnter={_onEnter}
                                    onFocus={_onFocus}
                                    refs={refs}
                                    tab={tab}
                                    index={i}>
                                    <div
                                        className='tabs-content'
                                        key={`${props.id}-tab-v-content-${i}`}>
                                        <div className='container'>
                                            {children}
                                        </div>
                                    </div>
                                </Tab>
                            ))}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <div className='accordion-actions'>
                <Button
                    color='clear'
                    data-align='right'
                    data-vertical-align='middle'
                    data-tooltip={__('Toggle direction')}
                    onClick={() => props.toggleVertical()}
                    children={<Icon name='Feather.MoreHorizontal' />}
                />
            </div>
        </>
    );
};

export { TabsVertical, TabsVertical as default };
