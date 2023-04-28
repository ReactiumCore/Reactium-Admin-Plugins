import cn from 'classnames';
import op from 'object-path';
import camelcase from 'camelcase';
import React, { useEffect, useRef } from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
} from 'reactium-core/sdk';

const options = opt =>
    Object.entries(opt).map(([key, value]) => ({
        key,
        value,
    }));

const types = arr => {
    Reactium.Hook.runSync('cte-object-types', arr);
    arr.sort();
    return arr;
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldType
 * -----------------------------------------------------------------------------
 */
export const FieldType = props => {
    const { id } = props;

    const refs = useRef({});

    const [state, setState] = useDerivedState({
        options: {},
        types: types(['number', 'tags', 'text', 'textarea', 'media']),
    });

    const { DragHandle } = props;
    const { Button, Icon } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const cx = Reactium.Utils.cxFactory('object-cte');

    const onAddClick = () => {
        let placeholder = op.get(refs.current, 'placeholder').value;
        let value = op.get(refs.current, 'value').value;
        let type = op.get(refs.current, 'type').value;
        let key = op.get(refs.current, 'key').value;

        if (!key) return;

        key = camelcase(key);

        const { options = {} } = state;

        const index = Object.keys(options).length;

        op.set(options, key, { index, key, placeholder, type, value });

        refs.current.type.focus();
        refs.current.key.value = '';
        refs.current.value.value = '';

        setState({ options });
    };

    const onBeforeSave = ({ fieldId, fieldValue }) => {
        if (fieldId === id) op.set(fieldValue, 'options', state.options);
    };

    const onChange = e => {
        const { options = {} } = state;
        const { value } = e.currentTarget;
        const { field, key } = e.currentTarget.dataset;
        op.set(options, [key, field], value);
        setState({ options });
    };

    const onDelete = key => {
        let { options = {} } = state;
        op.del(options, key);

        Object.keys(options).forEach((key, i) =>
            op.set(options, [key, 'index'], i),
        );

        setState({ options });
    };

    const onDragEnd = e => {
        const { options } = state;

        const index = {
            current: op.get(e, 'destination.index', undefined),
            previous: op.get(e, 'source.index'),
        };

        if (index.current === undefined || index.current === index.previous)
            return;

        const keys = Object.keys(options);
        const key = keys[index.previous];
        keys.splice(index.previous, 1);
        keys.splice(index.current, 0, key);

        const newOptions = keys.reduce((obj, k, i) => {
            op.set(obj, k, op.get(options, k));
            op.set(obj, [k, 'index'], i);
            return obj;
        }, {});

        setState({ options: newOptions });
    };

    const onEnterPress = e => {
        if (e.which === 13) {
            e.preventDefault();
            onAddClick();
        }
    };

    const onFormChange = ({ value }) => {
        if (value) setState({ options: op.get(value, 'options', {}) });
    };

    const onLoad = () => {
        const hooks = [
            Reactium.Hook.register(
                `field-type-form-change-${id}`,
                onFormChange,
            ),
            Reactium.Hook.registerSync('content-type-form-save', onBeforeSave),
        ];

        return () => {
            hooks.forEach(hookId => Reactium.Hook.unregister(hookId));
        };
    };

    useEffect(onLoad);

    return (
        <FieldTypeDialog {...props} showHelpText={false}>
            <div className={cx()}>
                <div className='input-group'>
                    <select ref={elm => op.set(refs.current, 'type', elm)}>
                        <option value='null'>{__('Type')}</option>
                        {state.types.map((type, i) => (
                            <option key={`type-${i}`}>{type}</option>
                        ))}
                    </select>
                    <input
                        type='text'
                        ref={elm => op.set(refs.current, 'key', elm)}
                        placeholder={__('Key')}
                        onKeyDown={onEnterPress}
                    />
                    <input
                        type='text'
                        ref={elm => op.set(refs.current, 'placeholder', elm)}
                        placeholder={__('Placeholder')}
                        onKeyDown={onEnterPress}
                    />
                    <input
                        type='text'
                        ref={elm => op.set(refs.current, 'value', elm)}
                        placeholder={__('Default value')}
                        onKeyDown={onEnterPress}
                    />
                    <Button
                        color={Button.ENUMS.COLOR.TERTIARY}
                        onClick={onAddClick}
                        className='add-btn'
                        style={{ padding: 0, height: 41, flexShrink: 0 }}>
                        <Icon
                            name='Feather.Plus'
                            size={22}
                            className='hide-xs show-md'
                        />
                        <span className='hide-md'>{__('Add Item')}</span>
                    </Button>
                </div>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId={cx('droppable')}>
                        {provided => (
                            <ul
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={cx('list')}>
                                {options(state.options).map(
                                    ({ key, value }, i) => (
                                        <ListItem
                                            index={i}
                                            k={key}
                                            key={`key-${key}`}
                                            onChange={onChange}
                                            onDelete={onDelete}
                                            types={state.types}
                                            value={value}
                                        />
                                    ),
                                )}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </FieldTypeDialog>
    );
};

const ListItem = props => {
    const { onChange, onDelete, index, k: key, types, value } = props;
    const { Button, Icon } = useHookComponent('ReactiumUI');
    return (
        <Draggable draggableId={key} index={index}>
            {(provided, snapshot) => (
                <li
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className={cn('list-item', {
                        dragging: snapshot.isDragging,
                    })}>
                    <div className='input-group'>
                        <select
                            data-key={key}
                            data-field='type'
                            onChange={onChange}
                            value={op.get(value, 'type', 'null')}>
                            <option value='null'>{__('Type')}</option>
                            {types.map((type, i) => (
                                <option key={`type-${i}`}>{type}</option>
                            ))}
                        </select>

                        <input
                            type='text'
                            placeholder={__('Key')}
                            value={key}
                            readOnly
                        />

                        <input
                            type='text'
                            data-key={key}
                            data-field='placeholder'
                            placeholder={__('Placeholder')}
                            value={op.get(value, 'placeholder') || ''}
                            onChange={onChange}
                        />

                        <input
                            type='text'
                            data-key={key}
                            data-field='value'
                            placeholder={__('Default Value')}
                            value={op.get(value, 'value') || ''}
                            onChange={onChange}
                        />

                        <Button
                            className='del-btn'
                            color={Button.ENUMS.COLOR.DANGER}
                            onClick={() => onDelete(key)}
                            style={{ padding: 0, height: 41 }}>
                            <Icon
                                className='hide-xs show-md'
                                name='Feather.X'
                                size={22}
                            />
                            <span className='hide-md'>
                                {__('Delete %key').replace(/\%key/gi, key)}
                            </span>
                        </Button>
                    </div>
                    <div className='drag-handle' />
                </li>
            )}
        </Draggable>
    );
};
