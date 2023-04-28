import React from 'react';
import cn from 'classnames';
import moment from 'moment';
import op from 'object-path';
import IconImg from '../IconImg';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Icon } from 'reactium-ui';
import Reactium, { __ } from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ListItem
 * -----------------------------------------------------------------------------
 */

const Ico = ({ cx, meta, title, to }) => {
    const i = op.get(meta, 'icon');
    return i ? (
        <Link to={to} className={cn(cx('icon'), 'ico')} title={title}>
            <Icon name={i} />
            <Icon name='Linear.Pencil2' />
        </Link>
    ) : (
        <Link to={to} className={cn(cx('graphic'), 'ico')} title={title}>
            <IconImg />
            <Icon name='Linear.Pencil2' />
        </Link>
    );
};

const Indicator = ({ count, ...props }) => (
    <Button
        outline
        readOnly
        style={{ height: 26 }}
        size={Button.ENUMS.SIZE.XS}
        className='px-xs-12 mx-xs-12'
        color={Button.ENUMS.COLOR.TERTIARY}
        appearance={Button.ENUMS.APPEARANCE.PILL}
        title={String(__('%n records')).replace(/%n/gi, count)}
        {...props}>
        {count}
    </Button>
);

const AddButton = ({ children, className, to, ...props }) => (
    <Button
        href={to}
        style={{ height: 26 }}
        title={__('Create New')}
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.primary}
        className={cn('px-xs-12', className)}
        appearance={Button.ENUMS.APPEARANCE.PILL}
        onClick={() => Reactium.Routing.history.push(to)}
        {...props}>
        <Icon name='Feather.Plus' size={16} />
        {children}
    </Button>
);

const ListItem = props => {
    const { cx, className, uuid } = props;

    const msg =
        props.createdAt === props.updatedAt ? __('created') : __('updated');

    const when = moment(new Date(props.updatedAt)).fromNow();

    const count = op.get(props, 'slugs', []);

    return (
        <div className={cx(className)}>
            <Ico
                {...props}
                to={`/admin/type/${uuid}`}
                title={__('Edit content type')}
            />
            <Link
                to={`/admin/type/${uuid}`}
                className={cx('item-title')}
                title={__('Edit content type')}>
                <div className='mb-xs-4'>{props.meta.label}</div>
                <div className='small'>
                    {msg} {when}
                </div>
            </Link>
            <div className={cx('item-info')}>
                <Indicator count={count.length} />
                <AddButton to={`/admin/content/${props.machineName}/new`} />
            </div>
        </div>
    );
};

ListItem.propTypes = {
    className: PropTypes.string,
};

ListItem.defaultProps = {
    className: 'item',
};

export { ListItem, ListItem as default };
