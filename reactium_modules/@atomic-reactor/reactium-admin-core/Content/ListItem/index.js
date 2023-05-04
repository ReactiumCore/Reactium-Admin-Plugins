import _ from 'underscore';
import cn from 'classnames';
import moment from 'moment';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Icon } from 'reactium-ui';
import React, { useEffect, useMemo, useState } from 'react';
import Reactium, { __, useDispatcher } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ListItem
 * -----------------------------------------------------------------------------
 */
export const ListItemIcon = ({ cx, meta, path, idField, ...props }) => {
    return (
        <Link
            className={cn(cx('icon'), 'ico')}
            to={`${path}/${op.get(props, idField)}`}>
            <Icon name={op.get(meta, 'icon', 'Feather.Typewriter')} />
            <Icon name='Linear.Pencil2' />
        </Link>
    );
};

export const ListItemTitle = props => {
    let p;

    switch (op.get(props, 'data-zone-ns')) {
        case 'admin-content-type-list':
            p = 'meta.label';
            break;

        default:
            p = 'title';
    }

    return <div className={props.cx('item-title')}>{op.get(props, p)}</div>;
};

export const ListItemMeta = props => {
    const slug = useMemo(() => {
        let s;

        switch (op.get(props, 'data-zone-ns')) {
            case 'admin-content-type-list':
                s = 'machineName';
                break;

            default:
                s = 'slug';
        }

        return String(op.get(props, s)).toLowerCase();
    }, []);

    return (
        <div className='small'>
            {slug}
            {' - '}
            {props.createdAt === props.updatedAt
                ? __('created')
                : __('updated')}{' '}
            {moment(new Date(props.updatedAt)).fromNow()}
        </div>
    );
};

export const ListItemCount = props => {
    const count = _.compact(op.get(props, 'slugs', [])).length;
    return (
        <Button
            outline
            size={Button.ENUMS.SIZE.XS}
            className='px-xs-12 mx-xs-12'
            color={Button.ENUMS.COLOR.TERTIARY}
            style={{ height: 26, minWidth: 44 }}
            appearance={Button.ENUMS.APPEARANCE.PILL}
            title={String(__('%n records')).replace(/%n/gi, count)}
            onClick={() =>
                Reactium.Routing.history.push(
                    `/admin/content/${props.machineName}/page/1`,
                )
            }>
            {count}
        </Button>
    );
};

export const ListItemAdd = ({ idField, path, ...props }) => (
    <Button
        style={{ height: 26 }}
        title={__('Create New')}
        className={cn('px-xs-12')}
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.primary}
        appearance={Button.ENUMS.APPEARANCE.PILL}
        children={<Icon name='Feather.Plus' size={16} />}
        onClick={() =>
            Reactium.Routing.history.push(`${path}/${op.get(props, idField)}`)
        }
    />
);

export const ListItemDelete = ({ dispatch, title, ...props }) => {
    let e;

    switch (op.get(props, 'data-zone-ns')) {
        case 'admin-content-type-list':
            e = 'content-type-delete';
            break;

        default:
            e = 'content-delete';
    }

    title = String(__('Delete %title')).replace(/%title/gi, title);

    const tip = {
        title,
        'data-align': 'left',
        'data-tooltip': title,
        'data-vertical-align': 'middle',
    };

    return (
        <div className='delete'>
            <button
                {...tip}
                onClick={() =>
                    dispatch(e, {
                        details: props,
                    })
                }>
                <Icon name='Feather.Trash2' />
            </button>
        </div>
    );
};

export const ListItemStatus = ({ status, handle }) => {
    const onClick = () => {
        const value = String(status).toUpperCase();
        const field = 'status';
        const type = handle.get('type');

        Reactium.Content.toggleFilter({ field, type, value });
    };

    const color = op.get(Reactium.Content.COLOR, status);

    const tip = {
        title: String(status).toLowerCase(),
        'data-align': 'left',
        'data-tooltip': String(status).toLowerCase(),
        'data-vertical-align': 'middle',
    };

    return (
        <Button
            {...tip}
            color={color}
            onClick={onClick}
            size={Button.ENUMS.SIZE.XS}
            appearance={Button.ENUMS.APPEARANCE.PILL}
            style={{ width: 16, height: 16, padding: 0 }}
        />
    );
};

export const ListItem = ({ registry, ...props }) => {
    const dispatch = useDispatcher({ props });

    const { className, idField, path, zone } = props;

    const [components, setComponents] = useState(registry.list);

    const filter = str => {
        const z = String(props.cx(`${zone}-${str}`)).toLowerCase();
        return _.sortBy(
            components.filter(item => item.zones.includes(z)),
            'order',
        );
    };

    useEffect(
        () =>
            registry.subscribe(() => {
                setComponents(registry.list);
            }),
        [],
    );

    return (
        <div className={cn(props.cx(zone), className)}>
            {filter('left').map(({ Component }, i) => (
                <Component
                    key={`${zone}-left-${i}`}
                    dispatch={dispatch}
                    {...props}
                />
            ))}

            <Link
                to={`${path}/${op.get(props, idField)}`}
                className={props.cx('item-info')}>
                {filter('center').map(({ Component }, i) => (
                    <Component
                        key={`${zone}-center-${i}`}
                        dispatch={dispatch}
                        {...props}
                    />
                ))}
            </Link>

            <div className={props.cx('item-actions')}>
                {filter('right').map(({ Component }, i) => (
                    <div
                        key={`${zone}-right-${i}`}
                        className={props.cx('item-actions-child')}>
                        <Component dispatch={dispatch} {...props} />
                    </div>
                ))}
            </div>
        </div>
    );
};

ListItem.propTypes = {
    className: PropTypes.string,
    idField: PropTypes.string,
    path: PropTypes.string,
    zone: PropTypes.string,
};

ListItem.defaultProps = {
    idField: 'uuid',
    zone: 'item',
};
