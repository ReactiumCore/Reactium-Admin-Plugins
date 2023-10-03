import _ from 'underscore';
import cn from 'classnames';
import Empty from './Empty';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Spinner } from 'reactium-ui';
import { ListItem } from '../ListItem';
import { useRouteParams } from 'reactium-admin-core';
import React, { useCallback, useEffect } from 'react';

import Reactium, {
    __,
    cxFactory,
    useHookComponent,
    useStateEffect,
    useSyncState,
    Zone,
} from '@atomic-reactor/reactium-core/sdk';

const ContentList = ({ className, limit: initialLimit, namespace, title }) => {
    const params = useRouteParams();

    const Helmet = useHookComponent('Helmet');

    const [data, fetch] = useHookComponent('useContent')(
        op.get(params, 'type'),
        false,
    );

    const state = useSyncState({
        filtered: false,
        limit: initialLimit,
        page: Number(op.get(params, 'page', 1)),
        pages: 1,
        search: '',
        type: op.get(params, 'type'),
        updated: null,
    });

    const filter = () => {
        if (!data || data === false) return;
        const { limit, page, search, type } = state.get();

        // apply search
        const matcher = (item) => {
            let match = String(op.get(item, 'title', ''))
                .toLowerCase()
                .includes(search);

            match = !match
                ? String(op.get(item, 'slug', ''))
                      .toLowerCase()
                      .includes(search)
                : match;

            return match;
        };

        let results = Array.from(data).filter(matcher);

        // apply filters
        let filters = op.get(Reactium.Content.filters, type, {});

        if (Reactium.Content.isFiltered(type)) {
            results = results.filter((item) => {
                let valid = true;

                Object.entries(filters).forEach(([field, values]) => {
                    if (valid === false) return;
                    let value = op.get(item, field);

                    switch (field) {
                        case 'user':
                            value = op.get(item, field)
                                ? item.user.objectId
                                : null;
                            break;
                    }

                    valid = _.flatten(values).includes(value);
                });

                return valid;
            });
        }

        // remove deleted records from list if it's not a filter
        if (
            !Reactium.Content.isFilter({
                field: 'status',
                type,
                value: Reactium.Content.STATUS.DELETED.value,
            })
        ) {
            results = results.filter(
                (item) =>
                    op.get(item, 'status') !==
                    Reactium.Content.STATUS.DELETED.value,
            );
        }

        const items = _.chunk(results, limit)[page - 1] || [];

        state.set({
            filtered: items,
            pages: Math.ceil(results.length / limit),
        });
    };

    const onSearch = useCallback((e) => {
        state.set('search', String(e.value || '').toLowerCase(), true);
        state.set('updated', Date.now());
    }, []);

    const isEmpty = useCallback(
        () => Boolean(data !== false && data.length < 1),
        [data],
    );

    const cx = cxFactory(namespace);

    useStateEffect(
        {
            [cx('search')]: onSearch,
        },
        [],
    );

    useEffect(() => {
        const path = op.get(Reactium.Routing.currentRoute, 'location.pathname');
        if (!String(path).startsWith('/admin/content')) return;

        const page = op.get(params, 'page', 1);
        const type = op.get(params, 'type');
        const curr = state.get('type');

        state.set({ page, type });

        if (type !== curr) fetch({ page, type });
    }, [params]);

    useEffect(() => {
        const type = state.get('type');

        return Reactium.Cache.subscribe(
            `content-filters.${type}`,
            async ({ op }) => {
                if (['set', 'del'].includes(op)) {
                    state.set('updated', Date.now());
                }
            },
        );
    }, [state.get('type')]);

    useEffect(() => filter(), [data, state.get('updated')]);

    const render = () => {
        const { filtered, type } = state.get();

        state.extend('cx', cx);
        state.extend('filter', filter);
        state.extend('isEmpty', isEmpty);

        const handle = {
            cx,
            type,
            'data-zone-ns': cx(),
            path: `/admin/content/${type}`,
            registry: Reactium.Content.ListComponent,
        };

        return filtered === false ? (
            <Spinner className={cx('spinner')} />
        ) : (
            <div className={cn({ [cx()]: true, [className]: !!className })}>
                <Helmet>
                    <title>
                        {String(title).replace('%type', state.get('type'))}
                    </title>
                </Helmet>
                <div className={cx('content')}>
                    {isEmpty() ? (
                        <Empty />
                    ) : (
                        <>
                            <Zone
                                zone={cx('top')}
                                data-zone-ns={cx()}
                                data-handle={handle}
                            />
                            {filtered.map((item) => (
                                <ListItem
                                    cx={cx}
                                    {...item}
                                    {...handle}
                                    handle={state}
                                    key={`${item.uuid}.${Date.now()}`}
                                    registry={Reactium.Content.ListComponents}
                                />
                            ))}
                            <Zone
                                zone={cx('bottom')}
                                data-zone-ns={cx()}
                                data-handle={handle}
                            />
                        </>
                    )}
                </div>
            </div>
        );
    };

    return render();
};

ContentList.propTypes = {
    className: PropTypes.string,
    limit: PropTypes.number,
    namespace: PropTypes.string,
    title: PropTypes.string,
};

ContentList.defaultProps = {
    limit: 50,
    namespace: 'admin-content-list',
    title: __('Content / %type'),
};

const ContentListShim = () => {
    const params = useRouteParams();
    return !op.get(params, 'type') ? null : <ContentList {...params} />;
};

export { ContentListShim, ContentListShim as default };
