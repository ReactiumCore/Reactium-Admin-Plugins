import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import JsxParser from 'react-jsx-parser';
import queryActions from './queryActions';
import React, { useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useDerivedState,
    useHookComponent,
} from 'reactium-core/sdk';

import {
    Alert,
    Button,
    Dropdown,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

const Error = ({ state, setState }) =>
    state.error ? (
        <Alert
            className='mt-xs-20 mb-xs-12'
            color={state.error.color}
            dismissable
            icon={<Icon name={state.error.icon} />}
            onDismiss={() => setState({ error: null })}>
            {state.error.message}
        </Alert>
    ) : null;

const Help = ({ state, setState }) => {
    const hideAlert = () => {
        Reactium.Prefs.set('admin.alert.cte.collection', false);
    };

    const hideHelp = () => {
        Reactium.Prefs.set('admin.help.cte.collection', false);
        setState({ help: false });
    };

    const showAlert = Reactium.Prefs.get('admin.alert.cte.collection', true);

    return state.help === true ? (
        <div className='help'>
            {showAlert === true && (
                <Alert
                    className='mb-xs-20'
                    color={Alert.ENUMS.COLOR.WARNING}
                    dismissable
                    icon={<Icon name='Feather.Info' />}
                    onDismiss={() => hideAlert()}>
                    {__(
                        'Using the Collection field type is risky business and should be done so with extreme care and caution.',
                    )}
                </Alert>
            )}
            <p>
                {__(
                    'Use Collections to aggregate data from other content types into this content type by constructing a query that will create references to the resulting content objects.',
                )}
            </p>
            <p>
                {__(
                    'Permissions and capabilities should be considered when constructing a query.',
                )}
            </p>
            <p>
                {__('For more information on query syntax see the ')}
                <a
                    className='link'
                    href='http://parseplatform.org/Parse-SDK-JS/api/2.12.0/Parse.Query.html'
                    target='_blank'>
                    {__('Parse API Documentation')}
                </a>
            </p>
            <Button
                className='btn-close'
                color='clear'
                size='xs'
                onClick={() => hideHelp()}>
                <Icon name='Feather.X' />
            </Button>
        </div>
    ) : null;
};

const Label = props => {
    let { config = {}, keys: key = [], options, value } = props;

    const keymap =
        key.length > 0 ? key.map(item => `'${item}'`).join(', ') : undefined;

    const markup = String(config.label)
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
            `<span className="period" /><kbd className="name">${config.id}</kbd>`,
        )
        .replace(/\(/g, '<kbd className="paren">(</kbd>')
        .replace(/\)/g, '<kbd className="paren">)</kbd>')
        .replace(/\[/g, '<kbd className="bracket">[</kbd>')
        .replace(/\]/g, '<kbd className="bracket">]</kbd>')
        .replace(
            /\{/g,
            '<kbd className="brace">&#123;<br /><span className="break" /></kbd>',
        )
        .replace(/\}/g, '<kbd className="brace"><br />&#125;</kbd>')
        .trim();

    return (
        <div className='label' tabIndex={1}>
            <JsxParser jsx={markup} renderInWrapper={false} />
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
    const [status, setStatus] = useState('init');
    const [types, setTypes] = useState();

    const fetch = () => {
        if (status !== 'init') return () => {};

        setStatus('fetching');

        Reactium.ContentType.types({ schema: true }).then(results => {
            setTypes(
                results.map(item => {
                    item.icon = op.get(item, 'meta.icon');
                    return item;
                }),
            );
            setStatus('ready');
        });

        return () => {};
    };

    useEffect(() => fetch(), [status]);

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
    v = v
        ? JSON.stringify(
              stringize(v)
                  .split(',')
                  .map(item => transformValue(item)),
          )
        : undefined;

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

// -----------------------------------------------------------------------------
// <FieldType />
// -----------------------------------------------------------------------------
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
    //const types = undefined;

    const [state, setNewState] = useDerivedState({
        error: null,
        func: null,
        help: Reactium.Prefs.get('admin.help.cte.collection', true),
        key: [],
        query: [],
        type: { type: 'Collection', machineName: null },
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
            setState({
                error: {
                    color: Alert.ENUMS.COLOR.DANGER,
                    focus: keyRef.current,
                    icon: 'Feather.AlertOctagon',
                    message,
                },
            });
            return;
        }

        if (isValueRequired && !value) {
            const message = 'enter value';
            setState({
                error: {
                    color: Alert.ENUMS.COLOR.DANGER,
                    focus: keyRef.current,
                    icon: 'Feather.AlertOctagon',
                    message,
                },
            });
            return;
        }

        // Label: get it from queryActions here because JSON.stringify will get rid of any label as a function
        const label =
            typeof func.label === 'function'
                ? func.label({ options, value, key })
                : func.label;

        const q = {
            id: uuid(),
            config: { ...func, label },
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
        const defaultKeys = ['ACL', 'machineName', 'createdAt', 'updatedAt'];
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

    const toggleHelp = () => {
        Reactium.Prefs.set('admin.help.cte.collection', !state.help);
        setState({ help: !state.help });
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

            let type = _.findWhere(types, { machineName: collection });

            // support older definition with objectId as collection
            if (!type) type = _.findWhere(types, { objectId: collection });

            if (type) {
                setState({ type, wait: null });
            }
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
        formRef.current.setValue({
            ...formValue,
            collection: item.machineName,
            targetClass: item.collection,
        });
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
        const { error, func, key = [], query = [], type } = state;

        const valueDefault = op.get(func, 'value.default');
        let valueInputType = 'text';

        switch (op.get(func, 'value.type')) {
            case 'number':
                valueInputType = 'number';
        }

        return (
            <FieldTypeDialog {...props} showHelpText={false}>
                {!types && (
                    <div className='flex-center py-xs-40'>
                        <Spinner />
                    </div>
                )}
                {types && types.length < 1 && <Empty />}
                {types && types.length > 0 && (
                    <>
                        <input
                            type='hidden'
                            name='query'
                            defaultValue={JSON.stringify(query)}
                        />
                        <input type='hidden' name='collection' />
                        <input type='hidden' name='targetClass' />
                        <div className='field-type-collection'>
                            <Help state={state} setState={setState} />

                            <Dropdown
                                data={types}
                                labelField='type'
                                maxHeight='calc(40vh)'
                                onItemClick={e => _onTypeSelect(e)}
                                ref={typeRef}
                                selection={[type.machineName]}
                                size='md'
                                valueField='machineName'>
                                <Button
                                    color='default'
                                    data-dropdown-element
                                    style={{ paddingLeft: 12, paddingRight: 8 }}
                                    type='button'>
                                    {op.get(type, 'meta.icon') && (
                                        <span
                                            style={{ width: 28 }}
                                            className='text-left'>
                                            <Icon
                                                name={type.meta.icon}
                                                size={18}
                                            />
                                        </span>
                                    )}
                                    <span className='flex-grow text-left'>
                                        {type.type}
                                    </span>
                                    <span style={{ paddingLeft: 8 }}>
                                        <Icon name='Feather.ChevronDown' />
                                    </span>
                                </Button>
                                <Button
                                    className='btn-help'
                                    color='clear'
                                    onClick={e => toggleHelp(e)}>
                                    <Icon name='Feather.Info' />
                                </Button>
                            </Dropdown>

                            <Error state={state} setState={setState} />

                            {type.machineName !== null && (
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
                                            style={{
                                                paddingLeft: 12,
                                                paddingRight: 8,
                                            }}
                                            type='button'>
                                            {op.get(type, 'meta.icon') &&
                                                !op.get(func, 'id') && (
                                                    <span
                                                        style={{ width: 28 }}
                                                        className='text-left'>
                                                        <Icon
                                                            name='Linear.Leaf'
                                                            size={16}
                                                        />
                                                    </span>
                                                )}
                                            <span className='flex-grow text-left'>
                                                {func
                                                    ? op.get(func, 'id')
                                                    : __('function')}
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
                                                <span
                                                    style={{ paddingLeft: 8 }}>
                                                    <Icon name='Feather.ChevronDown' />
                                                </span>
                                            </Button>
                                        </Dropdown>
                                    )}
                                    {func && op.get(func, 'value') && (
                                        <input
                                            className='value'
                                            defaultValue={valueDefault}
                                            ref={valueRef}
                                            type={valueInputType}
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
                                            placeholder={
                                                func.options.placeholder
                                            }
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
                    </>
                )}
            </FieldTypeDialog>
        );
    };

    return render();
};

const Empty = () => (
    <div
        className='help flex-middle flex-center flex-column gray'
        style={{ minHeight: 147 }}>
        <Icon
            name='Feather.AlertOctagon'
            size={48}
            style={{ color: 'currentColor' }}
        />
        <p className='text-center mt-xs-20'>
            {__(
                'Once you have created content types come back and configure this collection',
            )}
        </p>
    </div>
);
