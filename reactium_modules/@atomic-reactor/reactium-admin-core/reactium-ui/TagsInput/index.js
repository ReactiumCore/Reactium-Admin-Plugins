import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Feather } from 'reactium-ui/Icon';
import { Scrollbars } from '@atomic-reactor/react-custom-scrollbars';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import {
    useDerivedState,
    useIsContainer,
} from '@atomic-reactor/reactium-sdk-core';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

const noop = () => {};

const ENUMS = {
    DIRECTION: {
        HORIZONTAL: 'horizontal',
        VERTICAL: 'vertical',
    },
    EVENT: {
        ADD: 'add',
        BLUR: 'blur',
        CHANGE: 'change',
        ERROR: 'error',
        FOCUS: 'focus',
        INIT: 'init',
        REMOVE: 'remove',
    },
};

/**
 * -----------------------------------------------------------------------------
 * Hook Component: TagsInput
 * -----------------------------------------------------------------------------
 */
let TagsInput = (
    {
        className,
        data,
        direction,
        editable,
        id,
        name,
        namespace,
        onAdd,
        onBlur,
        onChange,
        onError,
        onFocus,
        onKeyDown,
        onInit,
        onRemove,
        sortable,
        validator,
        value,
        ...props
    },
    ref,
) => {
    // Refs
    const containerRef = useRef();
    const inputRef = useRef();
    const suggestRef = useRef();
    const valueRef = useRef();

    const isContainer = useIsContainer();

    // State
    const [state, setState] = useDerivedState({
        prevState: {},
        data,
        dismissable: true,
        editable,
        focus: false,
        index: null,
        initialized: false,
        search: null,
        suggest: [],
        suggestIndex: -1,
        value,
        ...props,
    });

    const _onArrowKey = e => {
        if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 9) {
            const { suggest = [], suggestIndex = -1 } = state;
            if (suggestIndex >= suggest.length - 1 && e.keyCode === 9) {
                setState({ dismissable: true });
                setTimeout(_suggestHide, 1);
                return;
            }

            e.preventDefault();
            setState({ dismissable: false });

            let inc = e.keyCode === 38 ? -1 : 1;
            inc = e.shiftKey && e.keyCode === 9 ? -1 : inc;

            _suggestFocus(inc);
            setTimeout(() => setState({ dismissable: true }), 100);
        }

        if (e.keyCode === 27) {
            e.preventDefault();
            setState({ dismissable: true });
            setTimeout(_suggestHide, 1);
        }
    };

    const _onChange = () => {
        const { initialized } = state;

        const evt = {
            type: ENUMS.EVENT.CHANGE,
            value: _value(),
            target: valueRef.current,
        };

        // Trigger onInit() instead of onChange on first load.
        if (initialized !== true) {
            state.initialized = true;
            evt.type = ENUMS.EVENT.INIT;
            onInit(evt);
            return;
        }

        onChange(evt);
    };

    const _onFocus = e => {
        const { type } = e;
        const focus = type === ENUMS.EVENT.FOCUS;

        setState({ focus });

        if (type === ENUMS.EVENT.FOCUS) {
            _suggestShow();
            onFocus(e);
        }

        if (type === ENUMS.EVENT.BLUR) {
            onBlur(e);
        }
    };

    const _onKeyDown = e => {
        if (e.keyCode === 13) {
            e.preventDefault();
            _addTag(e.target.value);
        }

        if (
            e.keyCode === 8 &&
            e.target.value.length < 1 &&
            e.shiftKey &&
            editable === true
        ) {
            _onRemove(_value().length - 1);
        }

        if (e.keyCode === 40 || e.keyCode === 38 || e.keyCode === 27) {
            _onArrowKey(e);
        }

        if (e.keyCode === 9) {
            const { suggest = [] } = state;
            if (suggest.length > 0) {
                _onArrowKey(e);
            }
        }

        onKeyDown(e);
    };

    const _onRemove = index => {
        if (index < 0) return;

        const value = _value();
        const list = Array.from(value);
        const item = list[index];
        list.splice(index, 1);
        setState({ value: list, changed: Date.now(), backspace: false });

        const evt = {
            type: ENUMS.EVENT.REMOVE,
            value: _value(),
            item,
            target: valueRef.current,
        };

        try {
            onRemove(evt);
        } catch (err) {}

        inputRef.current.focus();
    };

    const _onReorder = e => {
        const value = _value();

        const startIndex = op.get(e, 'source.index');
        const endIndex = op.get(e, 'destination.index');
        const list = Array.from(value);
        const [item] = list.splice(startIndex, 1);

        if (typeof endIndex === 'undefined') {
            setState({ value: list, changed: Date.now() });
            return;
        }

        list.splice(endIndex, 0, item);
        setState({ value: list, changed: Date.now() });
    };

    const _addTag = val => {
        val = _.isObject(val) ? op.get(val, 'value') : val;
        val = isNaN(val) ? val : Number(val);

        const isValid = validator(val, { state, ref });

        let evt;

        if (isValid !== true) {
            evt = {
                type: ENUMS.EVENT.ERROR,
                value: val,
                error: isValid,
                target: inputRef,
            };

            onError(evt);
            return;
        }

        const value = _value();
        value.push(val);

        evt = {
            type: ENUMS.EVENT.ADD,
            value: _value(),
            item: val,
            target: valueRef.current,
        };

        setState({ value, changed: Date.now(), suggest: [], suggestIndex: -1 });

        try {
            onAdd(evt);
        } catch (err) {
            console.log(err);
        }

        inputRef.current.value = '';
        inputRef.current.focus();
    };

    const _index = () => {
        const { data = [] } = state;

        if (data.length > 0) {
            const index = data.map((item, i) => {
                if (typeof item === 'string') {
                    item = {
                        search: String(item)
                            .trim()
                            .split(' '),
                        value: item,
                        label: item,
                    };
                } else {
                    let sarr = item.value.split(' ');
                    sarr = sarr.concat(item.label.split(' '));
                    item.search = sarr.join(' ').split(' ');
                }

                item['search'] = _.compact(_.uniq(item.search)).join(' ');
                item['id'] = i;

                return item;
            });

            setState({ index });
        }
    };

    const _isChild = child => isContainer(child, containerRef.current);

    const _search = search => {
        if (!search || String(search).length < 2) {
            setState({ suggest: [] });
            _suggestHide();
            return;
        }

        const { index } = state;

        if (!index) {
            setState({ suggest: [] });
            return;
        }

        const exp = new RegExp(search, 'i');
        const results = index.filter(
            item => String(item.search).search(exp) > -1,
        );

        setState({ suggest: results });
        _suggestShow();
    };

    const _suggestDismiss = e => {
        if (!e) {
            return;
        }

        if (_isChild(e.target)) {
            return;
        }

        _suggestHide();
    };

    const _suggestFocus = inc => {
        if (!suggestRef.current) return;

        _suggestShow();
        let { suggest = [], suggestIndex = -1 } = state;

        const selector = `.${namespace}-suggest-btn`;
        const btns = suggestRef.current.querySelectorAll(selector);

        suggestIndex += inc;
        suggestIndex = Math.max(-2, suggestIndex);
        suggestIndex = Math.min(suggest.length, suggestIndex);
        suggestIndex = suggestIndex === suggest.length ? -1 : suggestIndex;
        suggestIndex = suggestIndex === -2 ? suggest.length - 1 : suggestIndex;

        const elm = suggestIndex === -1 ? inputRef.current : btns[suggestIndex];

        setState({ suggestIndex });

        elm.focus();
    };

    const _suggestHide = () => {
        if (!suggestRef.current) return;
        const { dismissable = false } = state;

        if (dismissable === true) {
            suggestRef.current.style.display = 'none';
            setState({ suggestIndex: -1 });
        }
    };

    const _suggestShow = () => {
        if (!suggestRef.current) return;
        suggestRef.current.style.display = 'block';
    };

    const _value = value => {
        value = value || op.get(state, 'value', []) || [];
        return Array.isArray(value) ? value : JSON.parse(value);
    };

    const _valueString = value => JSON.stringify(_value(value));

    // External Interface
    useImperativeHandle(ref, () => ({
        container: containerRef.current,
        setState,
        state: state,
        value: _value(),
    }));

    // Renderers
    const renderTag = (label, index) => (
        <span key={`${namespace}-tag-${index}`} className={`${namespace}-tag`}>
            <span className='label'>{state.formatter(label)}</span>
            {editable && !props.disabled && !props.readOnly && (
                <button type='button' onClick={() => _onRemove(index)}>
                    <Feather.X />
                </button>
            )}
        </span>
    );

    const renderDraggableTag = (label, index) => (
        <Draggable
            key={`${namespace}-tag-${index}`}
            draggableId={`${namespace}-tag-${index}`}
            index={index}>
            {(provided, snapshot) => (
                <span
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={cn({
                        [`${namespace}-tag`]: true,
                        dragging: snapshot.isDragging,
                    })}>
                    <span className='label'>{state.formatter(label)}</span>
                    {editable && !props.disabled && !props.readOnly && (
                        <button type='button' onClick={() => _onRemove(index)}>
                            <Feather.X />
                        </button>
                    )}
                </span>
            )}
        </Draggable>
    );

    const renderSuggestions = () => {
        const { suggest = [] } = state;

        return (
            <div className={`${namespace}-suggest`} ref={suggestRef}>
                {suggest.length > 0 && (
                    <Scrollbars
                        autoHeight
                        autoHeightMin={0}
                        autoHeightMax={245}
                        thumbMinSize={5}>
                        <ul>
                            {suggest.map((item, i) => (
                                <li key={`suggest-${i}`}>
                                    <button
                                        type='button'
                                        onKeyDown={_onArrowKey}
                                        className={`${namespace}-suggest-btn`}
                                        onClick={() =>
                                            _addTag(
                                                item.value || item,
                                                'suggest',
                                            )
                                        }>
                                        {item.label || item}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Scrollbars>
                )}
            </div>
        );
    };

    const renderTags = () => {
        const value = _value();
        const inputProps = { ...props };
        delete inputProps.formatter;

        return sortable && editable && !props.disabled && !props.readOnly ? (
            <DragDropContext onDragEnd={_onReorder}>
                <Droppable
                    droppableId={`${id}-${uuid()}`}
                    direction={direction}>
                    {(provided, snapshot) => (
                        <div
                            className={cn({
                                [`${namespace}-tags`]: true,
                                dropping: snapshot.isDraggingOver,
                            })}
                            {...provided.droppableProps}
                            ref={provided.innerRef}>
                            {value.map(renderDraggableTag)}
                            <span className='flex-grow'>
                                <input
                                    type='text'
                                    autoComplete='off'
                                    {...inputProps}
                                    ref={inputRef}
                                    onBlur={_onFocus}
                                    onFocus={_onFocus}
                                    onKeyDown={_onKeyDown}
                                    onChange={e => _search(e.target.value)}
                                />
                                {renderSuggestions()}
                            </span>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        ) : (
            <div className={`${namespace}-tags`}>
                {value.map(renderTag)}
                <span className='flex-grow'>
                    <input
                        type='text'
                        autoComplete='off'
                        {...inputProps}
                        ref={inputRef}
                        onBlur={_onFocus}
                        onFocus={_onFocus}
                        onKeyDown={_onKeyDown}
                        onChange={e => _search(e.target.value)}
                    />
                    {renderSuggestions()}
                </span>
            </div>
        );
    };

    const render = () => {
        const { focus = false } = state;

        const cname = cn({
            [className]: !!className,
            [namespace]: !!namespace,
            focus,
        });

        return (
            <>
                {name && (
                    <input
                        type='hidden'
                        id={id}
                        name={name}
                        value={_valueString()}
                        ref={valueRef}
                    />
                )}
                <div ref={containerRef} className={cname}>
                    {renderTags()}
                </div>
            </>
        );
    };

    // Side Effects
    useEffect(() => {
        setState({ data });
        _index();
    }, [data]);

    useEffect(() => {
        setState({ value });
    }, [value]);

    useEffect(() => _onChange(), [state.changed]);

    useEffect(() => setState(props), Object.values(props));

    useEffect(() => {
        if (!containerRef.current || typeof window === 'undefined') return;

        window.addEventListener('mouseup', _suggestDismiss);
        window.addEventListener('touchend', _suggestDismiss);

        return () => {
            window.removeEventListener('mouseup', _suggestDismiss);
            window.removeEventListener('touchend', _suggestDismiss);
        };
    }, [containerRef.current]);

    return render();
};

TagsInput = forwardRef(TagsInput);

TagsInput.propTypes = {
    className: PropTypes.string,
    editable: PropTypes.bool,
    formatter: PropTypes.func,
    namespace: PropTypes.string,
    sortable: PropTypes.bool,
    onAdd: PropTypes.func,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    onError: PropTypes.func,
    onFocus: PropTypes.func,
    onKeyDown: PropTypes.func,
    onInit: PropTypes.func,
    onRemove: PropTypes.func,
    validator: PropTypes.func,
};

TagsInput.defaultProps = {
    direction: ENUMS.DIRECTION.HORIZONTAL,
    editable: true,
    id: uuid(),
    formatter: value => value,
    namespace: 'ar-tags-input',
    onAdd: noop,
    onBlur: noop,
    onChange: noop,
    onError: noop,
    onFocus: noop,
    onKeyDown: noop,
    onInit: noop,
    onRemove: noop,
    sortable: false,
    validator: value => value.length > 0,
};

export { TagsInput, TagsInput as default };
