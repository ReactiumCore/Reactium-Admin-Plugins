import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
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
    const optRef = useRef();
    const typeRef = useRef();
    const valueRef = useRef();

    const { DragHandle } = props;
    const FieldTypeDialog = useHookComponent('FieldTypeDialog', DragHandle);

    const [types] = useTypes();

    const [state, setNewState] = useDerivedState({
        error: null,
        func: null,
        key: [],
        query: [],
        type: { type: 'Collection', objectId: null },
        wait: null,
    });

    const funcAdd = () => {
        let options = optRef.current ? optRef.current.value : '';
        let value = valueRef.current ? valueRef.current.value : '';
        let { func, key = [], query = [] } = state;

        const isArray = op.get(func, 'value.type') === 'array';

        options = _.compact([options]);
        options = _.isEmpty(options) ? undefined : objectify(options);

        value = _.isEmpty(_.compact([value])) ? undefined : value;
        value =
            value && isArray
                ? arrayize(value)
                : value && JSON.stringify(transformValue(stringize(value)));

        key = _.flatten([key]);

        const isValueRequired = op.get(func, 'value.required', false);
        const isKeyRequired = op.get(func, 'key.required', false);

        if (isKeyRequired && key.length < 1) {
            const message = op.get(func, 'key.multiple')
                ? 'select keys'
                : 'select a key';
            setState({ error: { message, focus: keyRef.current } });
            return;
        }

        if (isValueRequired && !value) {
            const message = 'enter value';
            setState({ error: { message, focus: valueRef.current } });
            return;
        }

        const q = {
            id: uuid(),
            config: func,
            func: func.id,
            keys: key,
            options,
            order: op.get(func, 'order', 100),
            value,
        };

        query.push(q);

        const added = [];

        const filterQuery = _.sortBy(query, 'order').filter(item => {
            const isExcluded = _shouldExclude(item, query);
            const isIncluded = !_shouldInclude(item, added);

            if (isExcluded || isIncluded) return false;

            added.push(item.func);
            return true;
        });

        const formValue = formRef.current.getValue();
        formRef.current.setValue({
            ...formValue,
            query: JSON.stringify(filterQuery),
        });

        if (keyRef.current) keyRef.current.setState({ selection: [] });
        if (optRef.current) optRef.current.value = '';
        if (valueRef.current) valueRef.current.value = '';

        setState({ error: null, key: [] });
    };

    const funcDel = id => {
        let { query = [] } = state;
        const index = _.findIndex(query, { id });

        if (index < 0) return;

        query.splice(index, 1);

        const formValue = formRef.current.getValue();
        formRef.current.setValue({
            ...formValue,
            query: JSON.stringify(query),
        });
    };

    const schema = () => {
        if (!op.get(state, 'type')) return [];
        const defaultKeys = ['ACL', 'objectId', 'createdAt', 'updatedAt'];
        const schema = op.get(state, 'type.schema', {});
        const schemaKeys = Object.keys(schema);
        schemaKeys.sort();

        const keys = _.chain([defaultKeys, schemaKeys])
            .flatten()
            .uniq()
            .value();

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

    const _shouldExclude = (item, query) => {
        const { config } = item;

        const excludeWhen = op.get(config, 'excludeWhen', []) || [];

        if (excludeWhen.length > 0) {
            const funcs = _.pluck(query, 'func');
            return _.intersection(excludeWhen, funcs).length > 0;
        }

        return false;
    };

    const _shouldInclude = (item, index) => {
        const { config, func } = item;

        const max = op.get(config, 'max');
        if (!max) return true;

        const count = index.filter(i => Boolean(i === func)).length;
        return count < max;
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
                            {func && op.get(func, 'options') && (
                                <input
                                    className='options'
                                    ref={optRef}
                                    type='text'
                                    style={{ flexGrow: 1 }}
                                    placeholder={func.options.placeholder}
                                />
                            )}
                            {func && (
                                <Button
                                    type='button'
                                    className='submit'
                                    color='tertiary'
                                    onClick={() => funcAdd()}>
                                    <Icon
                                        name='Feather.Plus'
                                        className='hide-xs show-lg'
                                    />
                                    <span className='show-xs- hide-lg'>
                                        Add Function
                                    </span>
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

const Label = props => {
    let { config = {}, keys: key = [], options, value } = props;

    const keymap =
        key.length > 0 ? key.map(item => `'${item}'`).join(', ') : undefined;

    const label = String(config.label)
        .replace(/\%value/gi, value || '')
        .replace(/\%options/gi, options || '')
        .replace(/\%key/gi, keymap || '')
        .replace(/\"/g, "'")
        .replace(/'([^']+)':/g, '<span className="key">$1:</span>')
        .replace(/'([^']+)'/g, '<span className="string">\'$1\'</span>')
        .replace(
            /\,/g,
            options && key.length < 1
                ? '<span className="comma">,</span><br /><span className="break" />'
                : '<span className="comma">,</span>',
        )
        .replace(/\:/g, '<span className="colon">:</span>')
        .replace(/\'true\'|true/gi, '<kbd className="boolean">true</kbd>')
        .replace(/\'false\'|false/gi, '<kbd className="boolean">false</kbd>')
        .replace(
            /\%func/gi,
            `<span className='period' /><kbd className='name'>${config.id}</kbd>`,
        )
        .replace(/\(/g, '<kbd className="paren">(</kbd>')
        .replace(/\)/g, '<kbd className="paren">)</kbd>')
        .replace(/\[/g, '<kbd className="bracket">[</kbd>')
        .replace(/\]/g, '<kbd className="bracket">]</kbd>')
        .replace(
            /\{/g,
            '<kbd className="brace">&#123;<br /><span className=\'break\' /></kbd>',
        )
        .replace(/\}/g, '<kbd className="brace"><br />&#125;</kbd>')
        .trim();

    return (
        <div className='label' tabIndex={1}>
            <JsxParser jsx={label} renderInWrapper={false} />
        </div>
    );
};

const Query = ({ className = 'query', query = [], onDelete }) => {
    if (query.length > 0) console.log(query);

    const buttonProps = {
        appearance: 'circle',
        className: 'func-del',
        color: 'danger',
        size: 'xs',
    };

    return _.isEmpty(query) ? null : (
        <div className={className}>
            <kbd>Query</kbd>
            {query.map(item => (
                <div key={`func-${item.id}`} className='func'>
                    <Button {...buttonProps} onClick={() => onDelete(item.id)}>
                        <Icon name='Feather.X' size={14} />
                    </Button>
                    <Label {...item} />
                </div>
            ))}
        </div>
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

const stringize = v => {
    v = String(v)
        .trim()
        .replace(/\s\s+/g, ' ')
        .replace(/\, /g, ',');
    return v;
};

const arrayize = v => {
    v = JSON.stringify(
        stringize(v)
            .split(',')
            .map(item => transformValue(item)),
    );

    return v;
};

const objectify = v => {
    v = _.isEmpty([v])
        ? undefined
        : String(v)
              .trim()
              .replace(/\s\s+/g, ' ')
              .replace(/\, /g, ',')
              .replace(/\ ,/g, ',')
              .replace(/ :/g, ':')
              .replace(/: /g, ':');

    v = _.isEmpty([v])
        ? undefined
        : JSON.stringify(
              v.split(',').reduce((obj, item) => {
                  const key = item.split(':').shift();
                  const val = transformValue(item.split(':').pop());
                  op.set(obj, key, val);
                  return obj;
              }, {}),
          );

    return v;
};

const transformValue = v => {
    if (v === 'true' || v === true) return true;
    if (v === 'false' || v === false) return false;
    if (!isNaN(v)) return Number(v);

    return `${String(v)
        .replace(/\'/g, '')
        .replace(/\"/g, '')}`;
};
