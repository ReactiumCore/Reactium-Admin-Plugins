import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import pluralize from 'pluralize';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Button, Icon } from 'reactium-ui';

import Reactium, {
    __,
    useIsContainer,
    useRefs,
    useRouting,
    useSyncState,
    Zone,
} from '@atomic-reactor/reactium-core/sdk';

export const SearchFilters = (props) => {
    const { cx } = props;

    const refs = useRefs();

    const routing = useRouting();

    const isContainer = useIsContainer();

    const state = useSyncState({
        route: routing.get('active.location.pathname'),
        type: routing.get('active.params.type'),
        updated: null,
        visible: false,
        props,
    });

    const visible = useCallback(() => state.get('visible'), []);

    const collapse = useCallback(() => state.set('visible', false), []);

    const dismiss = useCallback((e) => {
        const container = refs.get('container');

        if (!visible()) return;
        if (isContainer(e.target, container)) return;

        collapse();
    }, []);

    const expand = useCallback(() => state.set('visible', true), []);

    const toggleFilter = useCallback(
        ({ field, value }) =>
            (e) => {
                collapse();
                const type = state.get('type');
                Reactium.Content.toggleFilter({ field, type, value });
            },
        [state.get('type')],
    );

    const toggleMenu = useCallback(() => state.set('visible', !visible()), []);

    useEffect(() => {
        const type = routing.get('active.params.type');
        state.set('type', type);
    }, [routing.get('active.params.type')]);

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

    useEffect(() => {
        window.addEventListener('mousedown', dismiss);
        window.addEventListener('touchstart', dismiss);

        return () => {
            window.removeEventListener('mousedown', dismiss);
            window.removeEventListener('touchstart', dismiss);
        };
    }, []);

    state.refs = refs;

    state.extend('collapse', collapse);
    state.extend('cx', cx);
    state.extend('dismiss', dismiss);
    state.extend('expand', expand);
    state.extend('toggleFilter', toggleFilter);
    state.extend('toggleMenu', toggleMenu);
    state.extend('visible', visible);

    return (
        <div
            className={cx('filters')}
            ref={(elm) => refs.set('container', elm)}
        >
            <Filters {...state.get()} />
            <div
                className={cn(cx('filters-menu'), {
                    visible: visible(),
                })}
            >
                <Zone zone={cx('filter-menu')} state={state} />
            </div>
            <Button
                onClick={toggleMenu}
                className='go ml-xs-4'
                size={Button.ENUMS.SIZE.XS}
                color={Button.ENUMS.COLOR.CLEAR}
            >
                <Icon name='Linear.Funnel' size={14} />
            </Button>
        </div>
    );
};

export const SearchFilterOptions = ({ state }) => {
    const { collapse, cx, toggleFilter } = state;

    const clear = useCallback(() => {
        Reactium.Content.clearFilter({
            type: state.get('type'),
        });

        collapse();
    }, [state.get('type')]);

    const color = useCallback(
        (k) => op.get(Reactium.Content.COLOR, k, Reactium.Content.COLOR.DRAFT),
        [],
    );

    const options = useMemo(
        () => Object.entries(Reactium.Content.filterOptions(state.get('type'))),
        [state.get('type]')],
    );

    return (
        <>
            {Reactium.Content.isFiltered(state.get('type')) && (
                <div className={cx('filters-menu-group')}>
                    <button className={cx('filters-menu-item')} onClick={clear}>
                        <span className={cn('ico', 'btn-danger')}>
                            <Icon name='Feather.X' size={8} />
                        </span>
                        {__('Clear Filters').toUpperCase()}
                    </button>
                </div>
            )}

            <div className={cx('filters-menu-group')}>
                <button
                    className={cx('filters-menu-item')}
                    onClick={toggleFilter({
                        field: 'user',
                        value: Reactium.User.current().objectId,
                    })}
                >
                    <Icon size={11} name='Linear.User' />
                    {__('My %types')
                        .replace(/%types/gi, pluralize(state.get('type')))
                        .toUpperCase()}
                </button>
            </div>

            {options.map(([field, values]) => (
                <div className={cx('filters-menu-group')} key={field}>
                    {values.map(({ label, value }, i) => {
                        const clr = `btn-${color(value)}`;

                        return (
                            <button
                                key={`${field}-${i}`}
                                className={cx('filters-menu-item')}
                                onClick={toggleFilter({ field, value })}
                            >
                                {field === 'status' && (
                                    <span className={cn('ico', clr)} />
                                )}
                                {label}
                            </button>
                        );
                    })}
                </div>
            ))}
        </>
    );
};

const Filters = ({ route, type }) => {
    const components = [];

    if (String(route).startsWith('/admin/content')) {
        if (type && Reactium.Content.isFiltered(type)) {
            Object.entries(Reactium.Content.filtersByType(type)).forEach(
                ([field, values]) => {
                    if (!values) return;
                    if (!_.isArray(values)) return;
                    values.forEach((value) =>
                        components.push({ field, value }),
                    );
                },
            );
        }
    }

    const onClick = (field, value) => () =>
        Reactium.Content.removeFilter({ field, type, value });

    const userLabel = () => {
        const user = Reactium.User.current(true);
        let name = user.get('fname');
        name = !name ? user.get('lname') : name;
        name = !name ? user.get('email') : name;

        return name;
    };

    const render = () => {
        return components.map(({ field, value }, i) => {
            const color = op.get(
                Reactium.Content.COLOR,
                value,
                Reactium.Content.COLOR.REMOVE,
            );

            const label = field === 'user' ? userLabel() : value;

            return (
                <Button
                    color={color}
                    className='filter'
                    key={`${field}-${i}`}
                    size={Button.ENUMS.SIZE.XS}
                    onClick={onClick(field, value)}
                >
                    {label}
                    <Icon name='Feather.X' size={14} />
                </Button>
            );
        });
    };

    return render();
};
