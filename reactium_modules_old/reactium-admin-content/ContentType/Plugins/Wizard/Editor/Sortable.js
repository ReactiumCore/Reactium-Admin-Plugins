import uuid from 'uuid/v4';
import cn from 'classnames';
import op from 'object-path';
import React, { useState } from 'react';
import { __, useHandle, useHookComponent } from 'reactium-core/sdk';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const noop = () => {};
const clone = arr => JSON.parse(JSON.stringify(arr));

const Item = ({ icon, index, title }) => {
    const { Icon } = useHookComponent('ReactiumUI');

    return (
        <Draggable
            index={index}
            key={`list-item-${index}`}
            draggableId={`list-item-${index}`}>
            {provided => {
                return (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className='wizard-sortable-item'>
                        {icon && <Icon className='icon' name={icon} />}
                        {title && <span className='title'>{title}</span>}
                        <div className='handle' {...provided.dragHandleProps} />
                    </div>
                );
            }}
        </Draggable>
    );
};

const Sortable = props => {
    const { onChange = noop } = props;
    const tools = useHandle('AdminTools');
    const [data, setData] = useState(props.data);
    const { Alert, Dialog } = useHookComponent('ReactiumUI');

    const _onChange = e => {
        const start = op.get(e, 'source.index');
        const end = op.get(e, 'destination.index');

        if (start === end || end === undefined) return;

        const value = clone(data);
        const item = clone(value[start]);

        if (start > end) {
            value.splice(start, 1);
            value.splice(end, 0, item);
        } else {
            value.splice(end + 1, 0, item);
            value.splice(start, 1);
        }

        setData(value);
        onChange({ value });
    };

    const _onDismiss = () => {
        const Modal = op.get(tools, 'Modal');
        Modal.hide();
    };

    return (
        <Dialog
            dismissable
            collapsible={false}
            onDismiss={_onDismiss}
            header={{ title: __('Sort Slides') }}>
            <DragDropContext onDragEnd={_onChange}>
                <Droppable droppableId={uuid()} direction='vertical'>
                    {(provided, snapshot) => (
                        <div
                            key='wizard-sortable'
                            {...provided.droppableProps}
                            className={cn('wizard-sortable', {
                                dragging:
                                    snapshot.isDraggingOver ||
                                    snapshot.draggingFromThisWith,
                            })}
                            ref={provided.innerRef}>
                            <Alert color={Alert.ENUMS.COLOR.INFO} icon={null}>
                                {__('Drag items to reorder')}
                            </Alert>
                            {data.map((item, i) => (
                                <Item
                                    {...item}
                                    key={`list-item-${i}`}
                                    index={i}
                                />
                            ))}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </Dialog>
    );
};

export { Sortable, Sortable as default };
