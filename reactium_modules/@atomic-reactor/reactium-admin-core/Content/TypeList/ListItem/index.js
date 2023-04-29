import _ from 'underscore';
import cn from 'classnames';
import moment from 'moment';
import op from 'object-path';
import IconImg from '../IconImg';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Icon } from 'reactium-ui';
import Reactium, { __ } from 'reactium-core/sdk';
import React, { useEffect, useState } from 'react';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ListItem
 * -----------------------------------------------------------------------------
 */
export const ListItemIcon = ({ cx, meta, title, uuid }) =>
    op.get(meta, 'icon') ? (
        <Link
            to={`/admin/type/${uuid}`}
            className={cn(cx('icon'), 'ico')}
            title={title}>
            <Icon name={meta.icon} />
            <Icon name='Linear.Pencil2' />
        </Link>
    ) : (
        <Link
            to={`/admin/type/${uuid}`}
            className={cn(cx('graphic'), 'ico')}
            title={title}>
            <IconImg />
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
            readOnly
            style={{ height: 26 }}
            size={Button.ENUMS.SIZE.XS}
            className='px-xs-12 mx-xs-12'
            color={Button.ENUMS.COLOR.TERTIARY}
            appearance={Button.ENUMS.APPEARANCE.PILL}
            title={String(__('%n records')).replace(/%n/gi, count)}>
            {count}
        </Button>
    );
};

export const ListItemAdd = ({ className, uuid }) => (
    <Button
        style={{ height: 26 }}
        title={__('Create New')}
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.primary}
        className={cn('px-xs-12', className)}
        appearance={Button.ENUMS.APPEARANCE.PILL}
        children={<Icon name='Feather.Plus' size={16} />}
        onClick={() => Reactium.Routing.history.push(`/admin/type/${uuid}`)}
    />
);

export const ListItem = ({ className, zone, ...props }) => {
    const [components, setComponents] = useState(ListItemRegistry.list);

    const filter = str => {
        const z = String(props.cx(`${zone}-${str}`)).toLowerCase();
        return _.sortBy(
            components.filter(item => item.zones.includes(z)),
            'order',
        );
    };

    useEffect(() => {
        return ListItemRegistry.subscribe(() => {
            setComponents(ListItemRegistry.list);
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

            <div className={props.cx('item-actions')}>
                {filter('right').map(({ Component }, i) => (
                    <Component key={`${zone}-right-${i}`} {...props} />
                ))}
            </div>
        </div>
    );
};

export const ListItemRegistry = Reactium.Utils.registryFactory(
    'ContentList',
    'id',
);

ListItemRegistry.mode = Reactium.Utils.Registry.MODES.CLEAN;

ListItem.propTypes = {
    className: PropTypes.string,
    zone: PropTypes.string,
};

ListItem.defaultProps = {
    zone: 'item',
};
