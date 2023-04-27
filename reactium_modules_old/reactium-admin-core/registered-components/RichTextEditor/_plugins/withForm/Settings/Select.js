import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import uuid from 'uuid/v4';
import camelcase from 'camelcase';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import Reactium, {
    __,
    ComponentEvent,
    useDerivedState,
    useEventHandle,
    useHookComponent,
    useRefs,
    useStatus,
} from 'reactium-core/sdk';

const noop = () => {};
const clone = arr => JSON.parse(JSON.stringify(arr));

let Select = (props, ref) => {
    const refs = useRefs();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    const [status, setStatus, isStatus] = useStatus();

    const [state, setState] = useDerivedState({
        value: clone(op.get(props, 'value', [])),
    });

    const add = () => {
        const lblRef = refs.get('lbl.add');
        const valRef = refs.get('val.add');

        const label = lblRef ? lblRef.value : null;
        const value = valRef ? valRef.value : null;

        if (_.compact([label, value]).length < 2) return;

        lblRef.value = '';
        valRef.value = '';
        valRef.focus();

        const options = clone(state.value);
        options.push({ label, value });
        setState({ value: options });
    };

    const edit = ({ index, label, value }) => {
        const options = clone(state.value);
        options.splice(index, 1, { label, value });
        setState({ value: options });
    };

    const del = idx => {
        const options = clone(state.value);
        options.splice(idx, 1);
        setState({ value: options });
    };

    const dispatch = (eventType, data = {}) => {
        const evt = new ComponentEvent(eventType, data);
        handle.dispatchEvent(evt);

        const etype = camelcase(`on-${eventType}`);
        const handler = op.get(props, etype);
        if (typeof handler === 'function') handler(evt);
    };

    const reorder = e => {
        const start = op.get(e, 'source.index');
        const end = op.get(e, 'destination.index');

        if (start === end || end === undefined) return;

        const options = clone(state.value);
        const item = clone(options[start]);

        if (start > end) {
            options.splice(start, 1);
            options.splice(end, 0, item);
        } else {
            options.splice(end + 1, 0, item);
            options.splice(start, 1);
        }

        setState({ value: options });
    };

    const _handle = () => ({
        add,
        delete: del,
        refs,
        setState,
        state,
        edit,
        value: state.value,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useEffect(() => {
        if (!isStatus('ready')) return;
        handle.value = state.value;
        dispatch('change', { value: state.value });
        setHandle(handle);
    }, [state.value]);

    useEffect(() => {
        if (isStatus('pending')) setStatus('ready', true);
    }, [status]);

    return (
        <div className='rte-form-select-options col-xs-12'>
            <div className='add-row'>
                <div className='input-group'>
                    <input
                        type='text'
                        placeholder={__('Value')}
                        ref={elm => refs.set('val.add', elm)}
                        onKeyUp={e => {
                            if (e.keyCode === 13) add();
                        }}
                    />
                    <input
                        type='text'
                        placeholder={__('Label')}
                        ref={elm => refs.set('lbl.add', elm)}
                        onKeyUp={e => {
                            if (e.keyCode === 13) add();
                        }}
                    />
                    <Button onClick={add}>
                        <Icon name='Feather.Plus' />
                    </Button>
                </div>
            </div>
            <DragDropContext onDragEnd={reorder}>
                <Droppable droppableId={uuid()} direction='vertical'>
                    {provided => (
                        <div
                            className='options'
                            ref={provided.innerRef}
                            {...provided.droppableProps}>
                            {state.value.map(({ label, value }, i) => (
                                <Item
                                    key={`option-item-${i}`}
                                    handle={handle}
                                    label={label}
                                    value={value}
                                    index={i}
                                />
                            ))}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

const Item = ({ handle, ...props }) => {
    const { index: i } = props;
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return (
        <Draggable index={i} draggableId={`option-item-${i}`}>
            {(provided, snapshot) => {
                if (snapshot.isDragging) {
                    op.set(provided, 'draggableProps.style.left', 0);
                }

                return (
                    <div
                        className={cn('edit-row', {
                            dragging: snapshot.isDragging,
                        })}
                        ref={provided.innerRef}
                        {...provided.draggableProps}>
                        <div className='input-group'>
                            <input
                                ref={elm => handle.refs.set(`val.${i}`, elm)}
                                onChange={e =>
                                    handle.edit({
                                        index: i,
                                        value: e.target.value,
                                        label: props.label,
                                    })
                                }
                                placeholder={__('Value')}
                                value={props.value}
                                type='text'
                            />
                            <input
                                ref={elm => handle.refs.set(`lbl.${i}`, elm)}
                                onChange={e =>
                                    handle.edit({
                                        index: i,
                                        value: props.value,
                                        label: e.target.value,
                                    })
                                }
                                placeholder={__('Label')}
                                value={props.label}
                                type='text'
                            />
                            <Button
                                color={Button.ENUMS.COLOR.DANGER}
                                onClick={() => handle.delete(i)}>
                                <Icon name='Feather.X' />
                            </Button>
                            <div
                                className='handle'
                                {...provided.dragHandleProps}
                            />
                        </div>
                    </div>
                );
            }}
        </Draggable>
    );
};

Select = forwardRef(Select);

export default Select;
