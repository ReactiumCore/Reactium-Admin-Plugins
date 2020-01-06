import React from 'react';
import { useHookComponent } from 'reactium-core/sdk';
import op from 'object-path';
import cn from 'classnames';
import { Draggable } from 'react-beautiful-dnd';

const DragHandle = props => (
    <div
        className='fieldtype-draggable'
        tabIndex={0}
        {...props.dragHandleProps}>
        <span className='sr-only'>Drag handle</span>
    </div>
);

const FieldType = props => {
    const index = op.get(props, 'order', 0);
    const type = op.get(props, 'type', 'text');
    const fieldTypeComponent = op.get(
        props,
        'fieldTypeComponent',
        `FieldType${type}`,
    );

    const Type = useHookComponent(fieldTypeComponent, DragHandle);

    return (
        <Draggable draggableId={props.id} index={index}>
            {({ innerRef, draggableProps, dragHandleProps }) => (
                <div
                    ref={innerRef}
                    {...draggableProps}
                    className={cn(
                        'field-type-wrapper',
                        `field-type-wrapper-${type
                            .toLowerCase()
                            .replace(/\s+/g, '')}`,
                    )}>
                    <Type
                        {...props}
                        dragHandleProps={dragHandleProps}
                        DragHandle={() => (
                            <DragHandle dragHandleProps={dragHandleProps} />
                        )}
                    />
                </div>
            )}
        </Draggable>
    );
};

export default FieldType;
