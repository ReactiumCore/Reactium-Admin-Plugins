import _ from 'underscore';
import cn from 'classnames';
import moment from 'moment';
import op from 'object-path';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Icon } from 'reactium-ui';
import React, { useEffect, useState } from 'react';
import Reactium, { __, useDispatcher } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ListItem
 * -----------------------------------------------------------------------------
 */
export const ListItemIcon = ({ cx, meta, title, uuid }) => (
    <Link
        to={`/admin/type/${uuid}`}
        className={cn(cx('icon'), 'ico')}
        title={title}>
        <Icon name={op.get(meta, 'icon', 'Feather.Typewriter')} />
        <Icon name='Linear.Pencil2' />
    </Link>
);

export const ListItemTitle = props => (
    <div className={props.cx('item-title')}>{props.meta.label}</div>
);

export const ListItemMeta = props => (
    <div className='small'>
        {props.createdAt === props.updatedAt ? __('created') : __('updated')}{' '}
        {moment(new Date(props.updatedAt)).fromNow()}
    </div>
);

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
                    `/admin/content/${pluralize(props.machineName)}/page/1`,
                )
            }>
            {count}
        </Button>
    );
};

export const ListItemAdd = ({ uuid }) => (
    <Button
        style={{ height: 26 }}
        title={__('Create New')}
        className={cn('px-xs-12')}
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.primary}
        appearance={Button.ENUMS.APPEARANCE.PILL}
        children={<Icon name='Feather.Plus' size={16} />}
        onClick={() => Reactium.Routing.history.push(`/admin/type/${uuid}`)}
    />
);

export const ListItemDelete = props => {
    const dispatch = useDispatcher({ props });
    return (
        <div className='delete'>
            <button
                onClick={() =>
                    dispatch('content-type-delete', {
                        details: props,
                    })
                }>
                <Icon name='Feather.Trash2' />
            </button>
        </div>
    );
};

export const ListItem = ({ className, zone, ...props }) => {
    const [components, setComponents] = useState(
        Reactium.ContentType.ListComponents.list,
    );

    const filter = str => {
        const z = String(props.cx(`${zone}-${str}`)).toLowerCase();
        return _.sortBy(
            components.filter(item => item.zones.includes(z)),
            'order',
        );
    };

    useEffect(() => {
        return Reactium.ContentType.ListComponents.subscribe(() => {
            setComponents(Reactium.ContentType.ListComponents.list);
        });
    }, []);

    return (
        <div className={cn(props.cx(zone), className)}>
            {filter('left').map(({ Component }, i) => (
                <Component key={`${zone}-left-${i}`} {...props} />
            ))}

            <Link
                to={`/admin/type/${props.uuid}`}
                className={props.cx('item-info')}
                title={__('Edit content type')}>
                {filter('center').map(({ Component }, i) => (
                    <Component key={`${zone}-center-${i}`} {...props} />
                ))}
            </Link>

            <div className={props.cx('item-EVENTS')}>
                {filter('right').map(({ Component }, i) => (
                    <Component key={`${zone}-right-${i}`} {...props} />
                ))}
            </div>
        </div>
    );
};

ListItem.propTypes = {
    className: PropTypes.string,
    zone: PropTypes.string,
};

ListItem.defaultProps = {
    zone: 'item',
};
