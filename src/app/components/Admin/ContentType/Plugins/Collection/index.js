import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Parse from 'appdir/api';
import JsxParser from 'react-jsx-parser';
import queryActions from './queryActions';
import React, { useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useHookComponent,
} from 'reactium-core/sdk';

import {
    Button,
    Checkbox,
    Dialog,
    Dropdown,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

export const FieldType = props => {
    const formRef = op.get(props, 'formRef');
    const funcRef = useRef();
    const keyRef = useRef();
    const typeRef = useRef();
    const valueRef = useRef();

    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const [types] = useTypes();

    const [state, setNewState] = useDerivedState({
        func: undefined,
        key: [],
        query: undefined,
        type: { type: 'Collection', objectId: null },
        wait: undefined,
    });

    const funcAdd = () => {
        let value = valueRef.current ? valueRef.current.value : '';
        let { func, key, query = [] } = state;
        let { label } = func;

        value =
            op.get(func, 'value.type') === 'array' &&
            JSON.stringify(
                String(value)
                    .replace(/ +/g, ' ')
                    .replace(/\, /g, ',')
                    .split(','),
            );

        label = String(label)
            .replace(/\%value/gi, value)
            .replace(/\%key/gi, key.map(item => `'${item}'`).join(', '))
            .replace(/\,/g, "<span className='comma'>,</span>")
            .replace(/\"/g, "'")
            .replace(/\%func/gi, `<kbd className='name'>${func.id}</kbd>`)
            .replace(/\(/g, "<kbd className='paren'>(</kbd>")
            .replace(/\)/g, "<kbd className='paren'>)</kbd>")
            .replace(/\[/g, "<kbd className='bracket'>[</kbd>")
            .replace(/\]/g, "<kbd className='bracket'>]</kbd>")
            .replace(/\{/g, "<kbd className='brace'>{</kbd>")
            .replace(/\}/g, "<kbd className='brace'>}</kbd>")
            .trim();

        const q = {
            func: func.id,
            key,
            label,
        };

        query.push(q);

        const formValue = formRef.current.getValue();
        formRef.current.setValue({
            ...formValue,
            query: JSON.stringify(query),
        });

        keyRef.current.setState({ selection: [] });

        if (valueRef.current) valueRef.current.value = '';

        setState({ key: [] });
    };

    const funcDel = index => {
        let { query = [] } = state;
        query.splice(index, 1);

        const formValue = formRef.current.getValue();
        formRef.current.setValue({
            ...formValue,
            query: JSON.stringify(query),
        });
    };

    const schema = () => {
        if (!op.get(state, 'type')) return [];
        const schema = op.get(state, 'type.schema', {});
        const keys = Object.keys(schema);
        keys.sort();
        return keys.map(key => ({ label: key, value: key }));
    };

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const unMounted = () => !formRef.current;

    const _onFormChange = e => {
        if (unMounted()) return;

        let { collection, query } = e.value;

        if (collection) {
            if (!types) {
                setState({ wait: e });
                return;
            }

            const type = _.findWhere(types, { objectId: collection });
            setState({ type, wait: null });
        }

        if (query) {
            query = typeof query === 'string' ? JSON.parse(query) : query;
            if (!_.isEqual(query, state.query)) setState({ query });
        }
    };

    const _onFuncSelect = ({ item }) => {
        if (keyRef.current) {
            keyRef.current.setState({
                selection: [],
                multiSelect: op.get(item, 'key.multiple', false),
            });
        }
        setState({ func: item, key: undefined });
    };

    const _onKeySelect = e => {
        setState({ key: e.selection });
    };

    const _onTypeSelect = ({ item }) => {
        const formValue = formRef.current.getValue();
        formRef.current.setValue({ ...formValue, collection: item.objectId });
    };

    useEffect(() => {
        if (unMounted()) return;
        formRef.current.addEventListener('change', e => _onFormChange(e));

        return () => {
            if (unMounted()) return;
            formRef.current.removeEventListener('change', e =>
                _onFormChange(e),
            );
        };
    });

    useEffect(() => {
        if (!types) return;
        const { wait } = state;
        if (wait) _onFormChange(wait);
    }, [types]);

    const render = () => {
        const { func, key = [], query = [], type } = state;

        return (
            <FieldTypeDialog {...props} showHelpText={false}>
                <input
                    type='hidden'
                    name='query'
                    defaultValue={JSON.stringify(query)}
                />
                <input type='hidden' name='collection' />
                <div className='field-type-collection'>
                    <Dropdown
                        data={types}
                        labelField='type'
                        maxHeight='calc(40vh)'
                        onItemClick={e => _onTypeSelect(e)}
                        ref={typeRef}
                        selection={[type.objectId]}
                        size='md'
                        valueField='objectId'>
                        <Button
                            color='default'
                            data-dropdown-element
                            style={{ paddingLeft: 12, paddingRight: 8 }}
                            type='button'>
                            {op.get(type, 'meta.icon') && (
                                <span
                                    style={{ width: 28 }}
                                    className='text-left'>
                                    <Icon name={type.meta.icon} size={18} />
                                </span>
                            )}
                            <span className='flex-grow text-left'>
                                {type.type}
                            </span>
                            <span style={{ paddingLeft: 8 }}>
                                <Icon name='Feather.ChevronDown' />
                            </span>
                        </Button>
                    </Dropdown>
                    {type.objectId !== null && (
                        <div
                            className={cn(
                                { 'input-group': !!func },
                                'mt-xs-8',
                            )}>
                            <Dropdown
                                data={queryActions}
                                labelField='id'
                                maxHeight='calc(40vh)'
                                onItemClick={e => _onFuncSelect(e)}
                                ref={funcRef}
                                valueField='id'>
                                <Button
                                    color='default'
                                    data-dropdown-element
                                    style={{ paddingLeft: 12, paddingRight: 8 }}
                                    type='button'>
                                    <span className='flex-grow text-left'>
                                        {func ? op.get(func, 'id') : 'Function'}
                                    </span>
                                    <span style={{ paddingLeft: 8 }}>
                                        <Icon name='Feather.ChevronDown' />
                                    </span>
                                </Button>
                            </Dropdown>
                            {func && op.get(func, 'key.placeholder') && (
                                <Dropdown
                                    data={schema()}
                                    maxHeight='calc(40vh)'
                                    multiSelect={func.key.multiple}
                                    onChange={e => _onKeySelect(e)}
                                    ref={keyRef}
                                    selection={key}>
                                    <Button
                                        color='default'
                                        data-dropdown-element
                                        style={{
                                            paddingLeft: 12,
                                            paddingRight: 8,
                                        }}
                                        type='button'>
                                        <span className='flex-grow text-left'>
                                            {key.length > 0
                                                ? key.join(', ')
                                                : func.key.placeholder}
                                        </span>
                                        <span style={{ paddingLeft: 8 }}>
                                            <Icon name='Feather.ChevronDown' />
                                        </span>
                                    </Button>
                                </Dropdown>
                            )}
                            {func && op.get(func, 'value') && (
                                <input
                                    className='value'
                                    ref={valueRef}
                                    type='text'
                                    style={{ flexGrow: 1 }}
                                    placeholder={func.value.placeholder}
                                />
                            )}
                            {func && (
                                <Button
                                    type='button'
                                    color='tertiary'
                                    onClick={() => funcAdd()}
                                    style={{
                                        width: 48,
                                        padding: 0,
                                        flexShrink: 0,
                                    }}>
                                    <Icon name='Feather.Plus' />
                                </Button>
                            )}
                        </div>
                    )}
                    <Query query={query} onDelete={funcDel} />
                </div>
            </FieldTypeDialog>
        );
    };

    return render();
};

const Label = ({ label = '' }) => {
    label = typeof label === 'string' ? label : JSON.stringify(label);
    return (
        <div className='label'>
            <JsxParser jsx={String(label)} renderInWrapper={false} />
        </div>
    );
};

const Query = ({ className = 'query', query = [], onDelete }) => {
    const buttonProps = {
        appearance: 'circle',
        className: 'func-del',
        color: 'danger',
        size: 'xs',
    };

    return _.isEmpty(query) ? null : (
        <div className={className}>
            <kbd>Query</kbd>
            {query.map((item, i) => {
                const { label } = item;

                return (
                    <div key={`func-${i}`} className='func'>
                        <Label {...item} />
                        <Button {...buttonProps} onClick={() => onDelete(i)}>
                            <Icon name='Feather.X' size={14} />
                        </Button>
                    </div>
                );
            })}
        </div>
    );
};

export const Editor = props => {
    const { editor, fieldName, required } = props;

    const inputRef = useRef();
    const ElementDialog = useHookComponent('ElementDialog');

    const inputProps = {
        name: fieldName,
        ref: inputRef,
    };

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20'>
                <div className={className}>
                    <div className='input-group'>COLLECTION</div>
                    {errorText && <small>{errorText}</small>}
                </div>
            </div>
        </ElementDialog>
    );
};

export const useTypes = () => {
    const noop = () => {};

    const [status, setStatus] = useState('init');
    const [types, setTypes] = useState();

    const fetch = () => {
        if (status !== 'init') return;

        setStatus('fetching');

        Reactium.ContentType.types({
            refresh: true,
            schema: true,
        }).then(results => {
            setTypes(
                results.map(item => {
                    item.icon = op.get(item, 'meta.icon');
                    return item;
                }),
            );
        });
    };

    useEffect(() => {
        fetch();
    }, [status]);

    return [types, setTypes];
};
