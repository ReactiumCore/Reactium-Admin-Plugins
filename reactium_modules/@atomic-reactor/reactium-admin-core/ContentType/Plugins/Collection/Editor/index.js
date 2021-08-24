import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import JsxParser from 'react-jsx-parser';
import React, { useEffect, useRef, useState } from 'react';

import CollectionList from './CollectionList';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useFulfilledObject,
    useHookComponent,
} from 'reactium-core/sdk';

import {
    Alert,
    Button,
    Dialog,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

const noop = () => {};

export const Editor = props => {
    const { editor, fieldName, required } = props;

    const containerRef = useRef();
    const queue = useRef({ add: [], id: uuid(), remove: [] });

    const ElementDialog = useHookComponent('ElementDialog');

    const [state, setNewState] = useDerivedState({
        errorText: op.get(editor.errors, [fieldName, 'message']),
        fetching: false,
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const [ready] = useFulfilledObject(state, [
        'collection',
        'query',
        'relation',
        'results',
    ]);

    const className = cn('form-group', 'collection', {
        error: !!state.errorText,
    });

    const flush = () => {
        const { add = [], remove = [] } = queue.current;

        if (add.length > 0) {
            relationAdd(add);
        }

        if (remove.length > 0) {
            relationRemove(remove);
        }
    };

    const getQuery = async () => {
        if (
            !state.collection ||
            !state.query ||
            state.results ||
            state.fetching === true
        ) {
            return;
        }

        setState({ fetching: true });

        const attributes = op.get(state, 'query');
        const collection = op.get(state, 'collection');
        const results = await Reactium.Cloud.run('dynamic-query', {
            attributes,
            collection,
        });

        setState({ results });

        _.defer(() => {
            setState({ fetching: false });
        });
    };

    const isMounted = () => !!containerRef.current;

    const isVisible = () => op.has(editor, 'value.objectId');

    const unMounted = () => !containerRef.current;

    const relationAdd = async objectIds => {
        queue.current.add = [];

        const params = {
            add: _.flatten([objectIds]),
            collection: op.get(editor.value, 'type.collection'),
            objectId: op.get(editor.value, 'objectId'),
            fieldName,
        };

        const relation = await Reactium.Cloud.run(
            'content-relation-add',
            params,
        );

        setState({ relation });
    };

    const relationGet = async () => {
        if (state.fetchRelation === true || !state.results) return;

        setState({ fetchRelation: true });

        const params = {
            collection: op.get(editor.value, 'type.collection'),
            objectId: op.get(editor.value, 'objectId'),
            fieldName,
        };

        const relation = await Reactium.Cloud.run(
            'content-relation-fetch',
            params,
        );

        const results = { ...state.results };

        Object.keys(relation).forEach(key => {
            if (op.get(results, key)) op.set(results, [key, 'selected'], true);
        });

        setState({ fetchRelation: false, relation, results });
    };

    const relationRemove = async objectIds => {
        queue.current.remove = [];

        const params = {
            collection: op.get(editor.value, 'type.collection'),
            objectId: op.get(editor.value, 'objectId'),
            fieldName,
            remove: _.flatten([objectIds]),
        };

        const relation = await Reactium.Cloud.run(
            'content-relation-remove',
            params,
        );
        setState({ relation });
    };

    const setQuery = () => {
        let queryOpt = String(op.get(props, 'query'));

        const { schema } = state;
        const { value } = editor;

        if (!schema || !value) return;

        // go through schema and replace `%variables`
        const schemaKeys = _.chain([
            ['createdAt', 'updatedAt', 'objectId'],
            Object.keys(schema),
        ])
            .flatten()
            .uniq()
            .value();

        queryOpt = _.sortBy(JSON.parse(queryOpt), 'order');

        const query = _.compact(
            queryOpt.map(item => {
                let { config, func, keys, options, value: values } = item;

                values = _.compact(_.flatten([values]));
                values = _.compact(
                    values.map(val => {
                        val = val.split('"').join('"');

                        schemaKeys.forEach(k => {
                            const splitter = `"%${k}"`;
                            let replacer = op.get(value, k, '');
                            replacer = isNaN(replacer)
                                ? replacer
                                : Number(replacer);
                            val = val.split(splitter).join(replacer);
                        });
                        return isNaN(val) ? val : Number(val);
                    }),
                );

                // validate if the func should be included
                const isKeyRequired = op.get(config, 'key.required', false);
                if (isKeyRequired && keys.length < 1) return;

                const isValueRequired = op.get(config, 'value.required', false);
                if (isValueRequired && values.length < 1) return;

                const isValueArray = op.get(config, 'value.type') === 'array';
                let args = isValueArray
                    ? [...keys, values]
                    : [...keys, ...values];

                args = _.compact(args);

                const obj = { func, args };
                if (options) op.set(obj, 'options', options);
                return obj;
            }),
        );

        setState({ query });
    };

    const _onClickAdd = (e, id) => {
        const results = { ...state.results };

        op.set(results, [id, 'selected'], true);

        setState({ results });

        queue.current.add.push(id);
        queue.current.add = _.uniq(queue.current.add);
        queue.current.remove = _.without(queue.current.remove, id);
    };

    const _onClickRemove = (e, id) => {
        const results = { ...state.results };
        op.set(results, [id, 'selected'], false);

        setState({ results });

        queue.current.remove.push(id);
        queue.current.remove = _.uniq(queue.current.remove);
        queue.current.add = _.without(queue.current.add, id);
    };

    const _onSearch = e => {
        const event = `collection-relation-search-${queue.current.id}`;
        editor.dispatch(event, { search: e.currentTarget.value });
    };

    // Set the state.collection & state.schema value
    useEffect(() => {
        const newState = {};
        if (op.get(editor.value, 'schema')) {
            newState['schema'] = editor.value.schema;
        }

        if (op.get(editor.value, [fieldName, 'className'])) {
            newState['collection'] = editor.value[fieldName]['className'];
        }

        if (Object.keys(newState).length > 0) {
            setState(newState);
        }
    }, [editor.value]);

    // Set the state.query value
    useEffect(() => {
        if (state.collection && !state.query) setQuery();
    }, [state.collection]);

    // Query the relation
    useEffect(() => {
        if (!state.relation && state.results && state.collection) relationGet();
    }, [state.relation, state.collection, state.results, editor.value]);

    // Get the query results
    useEffect(() => {
        if (!state.results) getQuery();
    }, [state.collection, state.query]);

    // process queue
    useEffect(() => {
        const id = `collection-relation-queue-${queue.current.id}`;

        Reactium.Pulse.register(id, () => flush(), { delay: 2000, repeat: -1 });

        return () => {
            Reactium.Pulse.unregister(id);
        };
    }, []);

    return (
        <ElementDialog {...props} elements={[<Search onSearch={_onSearch} />]}>
            <div ref={containerRef} className={className}>
                {!ready && isVisible() && <Spinner className='spinner' />}
                {ready && isVisible() && (
                    <CollectionList
                        state={state}
                        editor={editor}
                        onClickAdd={_onClickAdd}
                        onClickRemove={_onClickRemove}
                        uuid={queue.current.id}
                    />
                )}
                {!isVisible() && (
                    <div className='p-xs-20'>
                        <Alert>
                            {__(
                                'After saving, %fieldName data will be retrieved.',
                            ).replace(/\%fieldName/gi, fieldName)}
                        </Alert>
                    </div>
                )}
            </div>
        </ElementDialog>
    );
};

const Search = ({ onSearch }) => {
    return (
        <label className='ar-data-table-search'>
            <input
                type='text'
                className='dialog-search'
                placeholder={__('Search')}
                onChange={onSearch}
            />
            <span className='bg' />
            <span className='ico'>
                <Icon name='Feather.Search' />
            </span>
        </label>
    );
};
