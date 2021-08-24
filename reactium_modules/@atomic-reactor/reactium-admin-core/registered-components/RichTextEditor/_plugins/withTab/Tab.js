import cn from 'classnames';
import op from 'object-path';
import React, { useRef } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { useHookComponent } from 'reactium-core/sdk';

const noop = () => {};

const Tab = props => {
    const {
        active,
        addTab,
        children,
        deleteTab,
        index,
        state,
        tab,
        refs,
        onChange = noop,
        onDrag = noop,
        onEnter = noop,
        onDrop = noop,
        onFocus = noop,
    } = props;

    const cname = cn('tab', { active: index === active });
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const handlers = useRef({
        onDrop: noop,
        onDrag: noop,
    });

    return (
        <Draggable
            key={`tab-${index}`}
            draggableId={`tab-${index}`}
            index={index}>
            {(provided, snapshot) => {
                op.set(
                    handlers.current,
                    'onDrag',
                    provided.dragHandleProps.onMouseDown,
                );
                op.set(
                    handlers.current,
                    'onDrop',
                    provided.dragHandleProps.onMouseUp,
                );
                const className = cn(cname, { dragging: snapshot.isDragging });

                provided.dragHandleProps.onMouseDown = e => {
                    onDrag({ ...e, index, props });
                    if (op.get(handlers.current, 'onDrag')) {
                        handlers.current.onDrag(e);
                    }
                };

                provided.dragHandleProps.onMouseUp = e => {
                    onDrop({ ...e, index, props });
                    if (op.get(handlers.current, 'onDrop')) {
                        handlers.current.onDrop(e);
                    }
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
                        {children}
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

export { Tab, Tab as default };
