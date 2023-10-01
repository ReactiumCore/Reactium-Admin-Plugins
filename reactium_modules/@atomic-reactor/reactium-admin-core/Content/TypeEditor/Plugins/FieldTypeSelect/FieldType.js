import { v4 as uuid } from 'uuid';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

const options = (opt) => {
    opt = _.isString(opt) ? JSON.parse(opt) : opt;
    return Object.entries(opt).map(([key, value]) => ({
        key,
        value,
    }));
};

/**
 * -----------------------------------------------------------------------------
 * Functional Component: FieldType
 * -----------------------------------------------------------------------------
 */
export const FieldType = (props) => {
    const { id } = props;

    const refs = useRef({
        options: null,
    });

    const currOptions = () => {
        let opt;

        if (props.formRef.current) {
            const values = props.formRef.current.getValue();
            if (op.get(values, 'options')) {
                opt = values.options;
            }
        }

        if (!opt) {
            opt = {};
        }

        opt = _.isString(opt) ? JSON.parse(opt) : opt;
        return opt;
    };

    const currMultiple = () => {
        let checked = false;

        if (props.formRef.current) {
            const values = props.formRef.current.getValue();
            checked = values.multiple || checked;
        }

        return checked;
    };

    const currRequired = () => {
        let checked = false;

        if (props.formRef.current) {
            const values = props.formRef.current.getValue();
            checked = values.required || checked;
        }

        return checked;
    };

    const [state, setState] = useDerivedState({
        options: currOptions(),
        required: currRequired(),
        multiple: currMultiple(),
    });

    const { DragHandle } = props;
    const { Button, Checkbox, Icon } = useHookComponent('ReactiumUI');
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const cx = Reactium.Utils.cxFactory('object-cte');

    const onAddClick = () => {
        let label = op.get(refs.current, 'label').value;
        let value = op.get(refs.current, 'value').value;
        let key = uuid();

        const { options = {} } = state;

        const index = Object.keys(options).length;

        op.set(options, key, { index, key, label, value });

        refs.current.value.value = null;
        refs.current.label.value = null;
        refs.current.label.focus();

        setState({ options });
        refs.current.options.value = JSON.stringify(options);
    };

    const onBeforeSave = ({ fieldId, fieldValue }) => {
        if (fieldId === id) {
            op.set(fieldValue, 'options', JSON.stringify(state.options));
            op.set(fieldValue, 'multiple', state.multiple || false);
            op.set(fieldValue, 'required', state.required || false);
        }
    };

    const onChange = (e) => {
        const { options = {} } = state;
        const { value } = e.currentTarget;
        const { field, key } = e.currentTarget.dataset;
        op.set(options, [key, field], value);
        setState({ options });
    };

    const onDelete = (key) => {
        let { options = {} } = state;
        op.del(options, key);

        Object.keys(options).forEach((key, i) =>
            op.set(options, [key, 'index'], i),
        );

        setState({ options });
    };

    const onDragEnd = (e) => {
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

    const onEnterPress = (e) => {
        if (e.which === 13) {
            e.preventDefault();
            onAddClick();
        }
    };

    const onFormChange = ({ value }) => {
        if (value) {
            let opts = op.get(value, 'options', {});
            opts = _.isString(opts) ? JSON.parse(opts) : opts;

            const multiple = op.get(value, 'multiple', false);
            const required = op.get(value, 'required', false);
            setState({ options: opts, multiple, required });
        }
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
            hooks.forEach((hookId) => Reactium.Hook.unregister(hookId));
        };
    };

    useEffect(onLoad);

    const render = () => {
        const opts = options(state.options);
        return (
            <FieldTypeDialog {...props} showHelpText={false}>
                <input
                    type='hidden'
                    name='options'
                    ref={(elm) => {
                        refs.current['options'] = elm;
                    }}
                />
                <div className={cx()}>
                    <div className='flex mb-xs-20'>
                        <div className='input-group flex-grow'>
                            <input
                                type='text'
                                name='placeholder'
                                placeholder={__('Placeholder')}
                            />
                            <input
                                type='text'
                                name='defaultValue'
                                placeholder={__('Default Value')}
                            />
                        </div>
                        <div
                            className='pl-xs-0 pl-md-20 flex'
                            style={{ flexShrink: 0 }}
                        >
                            <Checkbox
                                value={true}
                                name='multiple'
                                labelAlign='right'
                                className='mr-xs-20'
                                label={__('Multiple')}
                                defaultChecked={state.multiple}
                            />

                            <Checkbox
                                value={true}
                                name='required'
                                labelAlign='right'
                                label={__('Required')}
                                defaultChecked={state.required}
                            />
                        </div>
                    </div>

                    <div className='mb-xs-8'>
                        <h4>Selections:</h4>
                    </div>
                    <div className='input-group'>
                        <input
                            type='text'
                            onKeyDown={onEnterPress}
                            placeholder={__('Label')}
                            ref={(elm) => op.set(refs.current, 'label', elm)}
                        />
                        <input
                            type='text'
                            onKeyDown={onEnterPress}
                            placeholder={__('Value')}
                            ref={(elm) => op.set(refs.current, 'value', elm)}
                        />
                        <Button
                            color={Button.ENUMS.COLOR.TERTIARY}
                            onClick={onAddClick}
                            className='add-btn'
                            style={{ padding: 0, height: 41, flexShrink: 0 }}
                        >
                            <Icon
                                name='Feather.Plus'
                                size={22}
                                className='hide-xs show-md'
                            />
                            <span className='hide-md'>{__('Add Item')}</span>
                        </Button>
                    </div>
                    {opts.length > 0 && (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId={cx('droppable')}>
                                {(provided) => (
                                    <ul
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={cx('list')}
                                    >
                                        {opts.map(({ key, value }, i) => (
                                            <ListItem
                                                k={key}
                                                index={i}
                                                value={value}
                                                key={`key-${key}`}
                                                onChange={onChange}
                                                onDelete={onDelete}
                                                types={state.types}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                </div>
            </FieldTypeDialog>
        );
    };

    return render();
};

const ListItem = (props) => {
    const { onChange, onDelete, index, k: key, value } = props;
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
                    })}
                >
                    <div className='input-group'>
                        <input
                            type='text'
                            data-key={key}
                            data-field='label'
                            onChange={onChange}
                            placeholder={__('Label')}
                            value={op.get(value, 'label') || ''}
                        />

                        <input
                            type='text'
                            data-key={key}
                            data-field='value'
                            onChange={onChange}
                            placeholder={__('Value')}
                            value={op.get(value, 'value') || ''}
                        />

                        <Button
                            className='del-btn'
                            onClick={() => onDelete(key)}
                            color={Button.ENUMS.COLOR.DANGER}
                            style={{ padding: 0, height: 41 }}
                        >
                            <Icon
                                className='hide-xs show-md'
                                name='Feather.X'
                                size={22}
                            />
                        </Button>
                    </div>
                    <div className='drag-handle' />
                </li>
            )}
        </Draggable>
    );
};
