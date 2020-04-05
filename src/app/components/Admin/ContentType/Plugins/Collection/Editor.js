import uuid from 'uuid/v4';
import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import JsxParser from 'react-jsx-parser';
import React, { useEffect, useRef, useState } from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useFulfilledObject,
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

const noop = () => {};

export const Editor = props => {
    const { editor, fieldName, required } = props;

    const containerRef = useRef();
    const ElementDialog = useHookComponent('ElementDialog');

    const [state, setNewState] = useDerivedState({
        collection: null,
        errorText: op.get(editor.errors, [fieldName, 'message']),
        fetching: false,
        query: null,
        results: null,
        schema: null,
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const [ready] = useFulfilledObject(state, [
        'collection',
        'query',
        'results',
    ]);

    const className = cn('form-group', 'collection', {
        error: !!state.errorText,
    });

    const isMounted = () => !!containerRef.current;
    const unMounted = () => !containerRef.current;

    const setQuery = () => {
        let queryOpt = String(op.get(props, 'query'));

        const { schema } = state;
        const { value } = editor;

        console.log(schema);

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
        console.log(state.collection, query);
    };

    // Get collection content type
    useAsyncEffect(
        async mounted => {
            if (state.collection) return noop;
            const collection = await Reactium.ContentType.retrieve({
                objectId: props.collection,
            });
            if (!mounted()) return noop;
            setState({ collection });
        },
        [state.collection],
    );

    // Set the state.schema value
    useEffect(() => {
        const schema = op.get(editor.value, 'schema');
        if (schema) setState({ schema: editor.value.schema });
    }, [editor.value]);

    // Set the state.query value
    useEffect(() => {
        if (state.collection && !state.query) setQuery();
    }, [state.collection, editor.value]);

    // Get the query results
    useAsyncEffect(
        async mounted => {
            if (
                !state.query ||
                !state.collection ||
                state.results ||
                state.fetching === true
            )
                return;
            setState({ fetching: true });
            const collection = op.get(state, 'collection.collection');
            const attributes = op.get(state, 'query');
            const results = await Reactium.Cloud.run('dynamic-query', {
                attributes,
                collection,
            });

            console.log('results:', results);

            if (!mounted()) return;

            setState({ results });
            _.defer(() => {
                setState({ fetching: false });
            });
        },
        [state.collection, state.query],
    );

    return (
        <ElementDialog {...props}>
            <div className='p-xs-20' ref={containerRef}>
                <div className={className}>
                    {!ready && <Spinner className='spinner' />}
                    {ready && <div className='input-group'>COLLECTION</div>}
                    {state.errorText && <small>{state.errorText}</small>}
                </div>
            </div>
        </ElementDialog>
    );
};
