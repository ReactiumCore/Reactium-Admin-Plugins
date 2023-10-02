import cn from 'classnames';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
} from 'react';

import Reactium, {
    useRefs,
    useSyncState,
    useDispatcher,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

const ListInput = forwardRef((props, ref) => {
    const refs = useRefs();

    const { placeholder, value: defaultValue } = props;

    const cx = Reactium.Utils.cxFactory('object-cte');

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const state = useSyncState({
        value: defaultValue || [],
    });

    const dispatch = useDispatcher({ props, state });

    const values = useMemo(
        () => state.get('value') || [],
        [state.get('value')],
    );

    const onDragEnd = (e) => {
        if (!e) return;
        if (!e.source) return;
        if (!e.destination) return;

        let vals = Array.from(values);

        const insert = e.destination.index;
        const curr = e.source.index;
        const item = vals[curr];

        vals.splice(curr, 1);
        vals.splice(insert, 0, item);

        state.set('value', vals);
    };

    const onDragStart = () => {
        const vals = state.get('value');
        state.set('value', vals);
    };

    const onInputChange =
        (i, emit = false) =>
        (e) => {
            const vals = Array.from(values);
            vals[i] = e.target.value;

            state.set('value', vals, emit);
        };

    const onAdd = (e) => {
        if (e.type === 'keyup' && e.which !== 13) return;
        const input = refs.get('add');
        const val = input.value;

        input.value = '';
        input.focus();

        if (String(val).length < 1) return;

        let vals = Array.from(values);
        vals.push(val);

        state.set('value', _.chain(vals).compact().uniq().value());
    };

    const onDelete = (index) => () => {
        let vals = Array.from(values);
        vals.splice(index, 1);
        state.set('value', vals);
    };

    state.value = values;

    state.extend('dispatch', dispatch);

    useEffect(() => {
        const prev = JSON.stringify(state.previous) || '{}';

        state.value = state.get('value');
        state.previous = state.value;

        dispatch('change', { previous: JSON.parse(prev), value: state.value });
    }, [state.get('value')]);

    useImperativeHandle(ref, () => state);

    return (
        <div className='ar-input-list'>
            <div className='input-group'>
                <input
                    type='text'
                    onKeyUp={onAdd}
                    className='mb-xs-0'
                    placeholder={placeholder}
                    style={{ marginBottom: 0 }}
                    ref={(elm) => refs.set('add', elm)}
                />
                <Button
                    onClick={onAdd}
                    className='add-btn'
                    color={Button.ENUMS.COLOR.TERTIARY}
                    style={{
                        width: 41,
                        height: 42,
                        padding: 0,
                        flexShrink: 0,
                    }}
                >
                    <Icon size={22} name='Feather.Plus' />
                </Button>
            </div>
            {values.length > 0 && (
                <DragDropContext
                    onDragEnd={onDragEnd}
                    onBeforeDragStart={onDragStart}
                >
                    <Droppable droppableId={cx('droppable')}>
                        {(provided) => (
                            <ul
                                tabIndex={-1}
                                className={cx('list')}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {values.map((item, index) => (
                                    <Draggable
                                        tabIndex={-1}
                                        index={index}
                                        key={`input-${index}`}
                                        draggableId={`input-${index}`}
                                    >
                                        {(provided, snapshot) => (
                                            <ListItem
                                                refs={refs}
                                                value={item}
                                                index={index}
                                                provided={provided}
                                                snapshot={snapshot}
                                                onDelete={onDelete}
                                                placeholder={placeholder}
                                                onInputChange={onInputChange}
                                            />
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
});

const ListItem = ({
    index,
    onInputChange,
    onDelete,
    placeholder,
    provided,
    refs,
    snapshot,
    value,
}) => {
    const id = uuid();
    const { Button, Icon } = useHookComponent('ReactiumUI');

    return (
        <li
            key={`item-${id}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            tabIndex={-1}
            className={cn('list-item', {
                dragging: snapshot.isDragging,
            })}
        >
            <div className='input-group' tabIndex={-1}>
                <input
                    type='text'
                    style={{
                        marginBottom: 0,
                    }}
                    defaultValue={value}
                    onBlur={onInputChange(index, true)}
                    onChange={onInputChange(index)}
                    placeholder={placeholder}
                    ref={(elm) => refs.set(`input${id}`, elm)}
                />
                <Button
                    className='add-btn'
                    onClick={onDelete(index)}
                    color={Button.ENUMS.COLOR.DANGER}
                    style={{
                        width: 41,
                        height: 42,
                        padding: 0,
                        flexShrink: 0,
                    }}
                >
                    <Icon size={22} name='Feather.X' />
                </Button>
            </div>
            <div className='drag-handle' />
        </li>
    );
};

export { ListInput, ListInput as default };
