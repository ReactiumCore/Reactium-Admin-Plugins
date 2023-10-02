import _ from 'underscore';
import op from 'object-path';
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';

import Reactium, {
    useRefs,
    useSyncState,
    useDispatcher,
    useHookComponent,
} from '@atomic-reactor/reactium-core/sdk';

const PointerInput = forwardRef((props, ref) => {
    const { collection, fieldName, value: defaultValue } = props;

    const refs = useRefs();

    const state = useSyncState({
        search: {},
        searchString: null,
        value: defaultValue,
    });

    const value = state.get('value');

    const dispatch = useDispatcher({ props, state });

    const { Button, Icon } = useHookComponent('ReactiumUI');

    const removePointer = () => {
        state.set('value', null);

        _.defer(() => {
            const input = refs.get('input');
            if (!input) return;
            input.select();
        });
    };

    const onCollectionSearch = (e) => searchCollection(e.target.value);

    const onCollectionSelect = (e) => state.set('value', e.value);

    const _searchCollection = async (search) => {
        const ref = refs.get('results');

        if (!search || (search && String(search).length < 1)) {
            state.set('search', null, false);
            state.set('search', {}, false);
            ref.set('results', []);

            return;
        }

        state.set('searchString', search, false);

        if (String(search).length < 2) return;

        const { results } = await Reactium.Cloud.run(
            'content-editor-collection-search',
            {
                collection,
                search,
            },
        );

        state.set('search.results', results, false);

        ref.set('results', results);
    };

    const searchCollection = _.throttle(_searchCollection, 500);

    const cx = Reactium.Utils.cxFactory('object-cte');

    state.value = value;

    state.extend('dispatch', dispatch);

    useEffect(() => {
        const previous = JSON.parse(
            JSON.stringify(state.get('previous') || {}),
        );
        state.value = state.get('value');
        state.set('previous', state.value);
        dispatch('change', { previous, value: state.value });
    }, [state.get('value')]);

    useImperativeHandle(ref, () => state);

    return !value ? (
        <>
            <div className='form-group my-xs-0'>
                <input
                    type='text'
                    key='input'
                    className='pl-xs-32 mb-xs-0'
                    onChange={onCollectionSearch}
                    placeholder={props.placeholder}
                    ref={(elm) => refs.set('input', elm)}
                    defaultValue={state.get('searchString')}
                />
                <span
                    style={{
                        left: 12,
                        top: '50%',
                        color: 'grey',
                        position: 'absolute',
                        transform: 'translateY(-50%)',
                    }}
                >
                    <Icon size={14} name='Feather.Search' />
                </span>
            </div>
            <PointerSearchResults
                onSelect={onCollectionSelect}
                value={state.get('search.results')}
                ref={(elm) => refs.set('results', elm)}
            />
        </>
    ) : (
        <div className='input-group' style={{ position: 'relative' }}>
            <input
                disabled
                type='text'
                key='label'
                className='mb-xs-0'
                defaultValue={op.get(value, 'label')}
                style={{
                    marginBottom: 0,
                    paddingLeft: op.get(value, 'image') ? 44 : null,
                }}
            />
            <Button
                onClick={removePointer}
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
            {op.get(value, 'image') && (
                <div
                    style={{
                        backgroundImage: `url('${value.image}')`,
                    }}
                    className={cx('collection-select-thumb')}
                />
            )}
            <input type='hidden' name={fieldName} defaultValue={value} />
        </div>
    );
});

const PointerSearchResults = forwardRef((props, ref) => {
    const state = useSyncState({
        results: op.get(props, 'value', []),
    });

    const results = state.get('results');

    const dispatch = useDispatcher({ props, state });

    const onSelect = (item) => () => {
        const { onSelect } = props;
        if (!_.isFunction(onSelect)) return;

        state.set('value', item, false);
        dispatch('select', { value: item });
    };

    state.results = results;

    state.extend('dispatch', dispatch);

    const cx = Reactium.Utils.cxFactory('object-cte');

    useEffect(() => {
        state.results = state.get('results');
    }, [state.get('results')]);

    useEffect(() => {
        if (!_.isFunction(props.onSelect)) return;
        state.addEventListener('select', props.onSelect);
        return () => {
            state.removeEventListener('select', props.onSelect);
        };
    }, [props.onSelect]);

    useImperativeHandle(ref, () => state);

    return results.length > 0 ? (
        <div className={cx('collection-list')}>
            {results.map((item) => (
                <button
                    type='button'
                    key={item.objectId}
                    onClick={onSelect(item)}
                    className={cx('collection-list-item')}
                >
                    {op.get(item, 'image') && (
                        <div
                            style={{
                                backgroundImage: `url('${item.image}')`,
                            }}
                            className={cx('collection-list-item-thumb')}
                        />
                    )}
                    {item.label}
                </button>
            ))}
        </div>
    ) : null;
});

export { PointerInput, PointerInput as default };
