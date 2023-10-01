import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import { v4 as uuid } from 'uuid';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
} from 'react';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';

import Reactium, {
    useRefs,
    useSyncState,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

export const Editor = (props) => {
    const refs = useRefs({ arrays: {}, inputs: {} });
    const { editor, fieldName } = props;
    const ElementDialog = useHookComponent('ElementDialog');
    const { Button, FormRegister, Icon, Toggle } =
        useHookComponent('ReactiumUI');

    const state = useSyncState({
        results: {},
    });

    const options = useMemo(
        () => _.sortBy(Object.values(props.options), 'index'),
        [props.options],
    );

    const onSubmit = useCallback((e) => {
        const lists = refs.get('arrays') || {};
        Object.entries(lists).forEach(([k, elm]) => {
            const fieldName = String(props.fieldName).startsWith('meta.')
                ? props.fieldName
                : `data.${props.fieldName}.${k}`;

            op.set(e.value, fieldName, elm.value);
        });
    }, []);

    const removePointer = (k) => () => {
        editor.Form.setValue(`${fieldName}.${k}`, null);
        _.defer(() => {
            const input = refs.get(['inputs', k]);
            if (!input) return;
            input.select();
        });
    };

    const onCollectionSearch =
        ({ key, collection }) =>
        (e) => {
            const str = e.target.value;
            searchCollection(collection, str, key);
        };

    const onCollectionSelect = (params) => () => {
        const { objectId, label, image, key } = params;
        editor.Form.setValue(`${fieldName}.${key}`, { objectId, label, image });
    };

    const _searchCollection = async (collection, search, key) => {
        state.set(['search', key], search);

        if (!search || (search && String(search).length < 1)) {
            state.set(['results', key], null);
            return;
        }

        if (String(search).length < 2) return;

        const results = await Reactium.Cloud.run(
            'content-editor-collection-search',
            {
                collection,
                search,
            },
        );

        state.set(['results', key], results);
    };

    const searchCollection = _.throttle(_searchCollection, 500);

    const cx = Reactium.Utils.cxFactory('object-cte');

    useEffect(() => {
        editor.addEventListener('submit', onSubmit);
        return () => {
            editor.removeEventListener('submit', onSubmit);
        };
    }, [editor]);

    return options.map((item) => {
        const { key, placeholder, type, value: defaultValue } = item;

        const name = `${fieldName}.${key}`;

        const id = `${fieldName}-${key}-input`;

        const v = editor.isNew
            ? defaultValue
            : op.get(editor.Form.value, [fieldName, key], null);

        const collection =
            type === 'pointer'
                ? Array.from(state.get(['results', key, 'results']) || [])
                : [];

        return (
            <ElementDialog
                {...props}
                key={`${id}-dialog`}
                fieldName={`${fieldName} / ${key}`}
            >
                <FormRegister>
                    <div className='p-xs-20'>
                        <div
                            className='form-group'
                            style={{ position: 'relative' }}
                        >
                            {type === 'string' && (
                                <textarea
                                    id={id}
                                    name={name}
                                    defaultValue={v || ''}
                                    placeholder={placeholder}
                                />
                            )}
                            {type === 'number' && (
                                <div className='flex-sm-middle'>
                                    <label
                                        className='col-xs-12 col-sm-10'
                                        htmlFor={id}
                                        style={{ fontWeight: 400 }}
                                    >
                                        {placeholder}
                                    </label>
                                    <div className='col-xs-12 col-sm-2 mt-xs-8 mt-sm-0'>
                                        <input
                                            id={id}
                                            name={name}
                                            type='number'
                                            defaultValue={v || ''}
                                            style={{
                                                width: '100%',
                                                textAlign: 'right',
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            {type === 'array' && (
                                <ListInput
                                    {...item}
                                    value={v}
                                    editor={editor}
                                    fieldName={fieldName}
                                    ref={(elm) =>
                                        refs.set(`arrays.${key}`, elm)
                                    }
                                />
                            )}
                            {type === 'boolean' && (
                                <Toggle
                                    name={name}
                                    value={true}
                                    defaultChecked={v}
                                    label={placeholder}
                                />
                            )}
                        </div>
                        {type === 'pointer' && !v && (
                            <>
                                <div className='form-group my-xs-0'>
                                    <input
                                        type='text'
                                        placeholder={placeholder}
                                        className='pl-xs-32 mb-xs-0'
                                        ref={(elm) =>
                                            refs.set(`inputs.${key}`, elm)
                                        }
                                        defaultValue={state.get([
                                            'search',
                                            key,
                                        ])}
                                        onKeyUp={onCollectionSearch({
                                            key,
                                            collection: item.value,
                                        })}
                                    />
                                    <span
                                        style={{
                                            left: 12,
                                            top: '50%',
                                            position: 'absolute',
                                            transform: 'translateY(-50%)',
                                            color: 'grey',
                                        }}
                                    >
                                        <Icon size={14} name='Feather.Search' />
                                    </span>
                                </div>
                                {collection.length > 0 && (
                                    <div className={cx('collection-list')}>
                                        {collection.map((item) => {
                                            return (
                                                <button
                                                    type='button'
                                                    key={item.objectId}
                                                    onClick={onCollectionSelect(
                                                        { ...item, key },
                                                    )}
                                                    className={cx(
                                                        'collection-list-item',
                                                    )}
                                                >
                                                    {op.get(item, 'image') && (
                                                        <div
                                                            style={{
                                                                backgroundImage: `url('${item.image}')`,
                                                            }}
                                                            className={cx(
                                                                'collection-list-item-thumb',
                                                            )}
                                                        />
                                                    )}
                                                    {item.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                        {type === 'pointer' && v && (
                            <div
                                className='input-group'
                                style={{ position: 'relative' }}
                            >
                                <input
                                    disabled
                                    type='text'
                                    className='mb-xs-0'
                                    value={op.get(v, 'label')}
                                    style={{
                                        marginBottom: 0,
                                        paddingLeft: op.get(v, 'image')
                                            ? 44
                                            : null,
                                    }}
                                />
                                <Button
                                    onClick={removePointer(key)}
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
                                {op.get(v, 'image') && (
                                    <div
                                        style={{
                                            backgroundImage: `url('${v.image}')`,
                                        }}
                                        className={cx(
                                            'collection-select-thumb',
                                        )}
                                    />
                                )}
                                <input type='hidden' name={name} value={v} />
                            </div>
                        )}
                    </div>
                </FormRegister>
            </ElementDialog>
        );
    });
};

const _ListInput = (props, ref) => {
    const refs = useRefs();

    const { placeholder } = props;

    const cx = Reactium.Utils.cxFactory('object-cte');

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const state = useSyncState({
        value: op.get(props, 'value', []),
    });

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

    const onInputChange = (i) => (e) => {
        const vals = Array.from(values);
        vals[i] = e.target.value;

        state.set('value', vals, false);
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

    const onDelete = (index) => (e) => {
        let vals = Array.from(values);
        vals.splice(index, 1);
        state.set('value', vals);
    };

    state.value = values;

    useEffect(() => {
        state.value = state.get('value');
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
                        {(provided) => {
                            return (
                                <ul
                                    className={cx('list')}
                                    ref={provided.innerRef}
                                    tabIndex={-1}
                                    {...provided.droppableProps}
                                >
                                    {values.map((item, index) => {
                                        const i = uuid();
                                        return (
                                            <Draggable
                                                tabIndex={-1}
                                                index={index}
                                                key={`input-${index}`}
                                                draggableId={`input-${index}`}
                                            >
                                                {(provided, snapshot) => (
                                                    <li
                                                        key={`item-${i}`}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        tabIndex={-1}
                                                        className={cn(
                                                            'list-item',
                                                            {
                                                                dragging:
                                                                    snapshot.isDragging,
                                                            },
                                                        )}
                                                    >
                                                        <div
                                                            className='input-group'
                                                            tabIndex={-1}
                                                        >
                                                            <input
                                                                type='text'
                                                                style={{
                                                                    marginBottom: 0,
                                                                }}
                                                                defaultValue={
                                                                    item
                                                                }
                                                                onBlur={onInputChange(
                                                                    index,
                                                                )}
                                                                onChange={onInputChange(
                                                                    index,
                                                                )}
                                                                placeholder={
                                                                    placeholder
                                                                }
                                                                ref={(elm) =>
                                                                    refs.set(
                                                                        `input${i}`,
                                                                        elm,
                                                                    )
                                                                }
                                                            />
                                                            <Button
                                                                className='add-btn'
                                                                onClick={onDelete(
                                                                    index,
                                                                )}
                                                                color={
                                                                    Button.ENUMS
                                                                        .COLOR
                                                                        .DANGER
                                                                }
                                                                style={{
                                                                    width: 41,
                                                                    height: 42,
                                                                    padding: 0,
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                <Icon
                                                                    size={22}
                                                                    name='Feather.X'
                                                                />
                                                            </Button>
                                                        </div>
                                                        <div className='drag-handle' />
                                                    </li>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </ul>
                            );
                        }}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
};

const ListInput = forwardRef(_ListInput);
