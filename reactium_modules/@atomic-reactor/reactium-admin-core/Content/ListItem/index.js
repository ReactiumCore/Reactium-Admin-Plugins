import _ from 'underscore';
import cn from 'classnames';
import moment from 'moment';
import op from 'object-path';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Icon } from 'reactium-ui';
import React, { forwardRef, useEffect, useMemo, useState } from 'react';

import Reactium, {
    __,
    useDispatcher,
    useHookComponent,
    useRefs,
    useSyncState,
} from '@atomic-reactor/reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ListItem
 * -----------------------------------------------------------------------------
 */

const updatedObj = (obj) => {
    const { type, uuid } = obj;
    const ck = `content.${type}.${uuid}`;
    const cached = Reactium.Cache.get(ck);

    if (cached) {
        const cupd = cached.updatedAt;
        const upd = obj.updatedAt;

        if (moment(cupd).isAfter(moment(upd))) {
            return { ...obj, ...cached };
        }
    }

    return obj;
};

export const ListItemIcon = ({ cx, meta, path, idField, ...props }) => {
    return (
        <Link
            className={cn(cx('icon'), 'ico')}
            to={`${path}/${op.get(props, idField)}`}
        >
            <Icon name={op.get(meta, 'icon', 'Feather.Typewriter')} />
            <Icon name='Linear.Pencil2' />
        </Link>
    );
};

export const ListItemTitle = (props) => {
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

export const ListItemMeta = (props) => {
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

export const ListItemCount = (props) => {
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
            }
        >
            {count}
        </Button>
    );
};

export const ListItemAdd = ({ type }) => (
    <Button
        style={{ height: 26 }}
        title={__('Create New')}
        className={cn('px-xs-12')}
        size={Button.ENUMS.SIZE.XS}
        color={Button.ENUMS.COLOR.primary}
        appearance={Button.ENUMS.APPEARANCE.PILL}
        onClick={() => Reactium.Content.newObject(type)}
        children={<Icon name='Feather.Plus' size={16} />}
    />
);

export const ListItemDelete = (props) => {
    const refs = useRefs();

    let { handle, status, title, type, uuid } = props;

    const state = useSyncState({
        uuid: props.uuid,
        status: 'READY',
        confirmInput: null,
        confirmMatch: __('purge content'),
    });

    const ConfirmBox = useHookComponent('ConfirmBox');

    const isStatus = (str) =>
        Boolean(
            String(str).toUpperCase() ===
                String(state.get('status')).toUpperCase(),
        );

    const tooltip =
        status !== Reactium.Content.STATUS.DELETED.value
            ? String(__('Delete %title')).replace(/%title/gi, title)
            : String(__('Purge %title')).replace(/%title/gi, title);

    const tip = {
        title: tooltip,
        type: 'button',
        'data-align': 'left',
        'data-tooltip': tooltip,
        'data-vertical-align': 'middle',
    };

    const onClick = () => {
        const evt =
            op.get(props, 'data-zone-ns') === 'admin-content-type-list'
                ? 'content-type-delete'
                : status !== Reactium.Content.STATUS.DELETED.value
                ? 'content-delete'
                : 'content-purge';

        handle.dispatch(evt, {
            detail: props,
        });
    };

    const onDelete = async (e) => {
        if (isStatus('PENDING')) return;

        if (e.detail.uuid !== uuid) return;

        const { Toast } = Reactium.State.Tools;

        state.set('status', 'PENDING');

        state.set('confirmInput', null);

        let icon, message, result, toastType;

        const isPurge = Boolean(
            props.status === Reactium.Content.STATUS.DELETED.value,
        );

        try {
            result = !isPurge
                ? await Reactium.Content.setStatus({
                      type,
                      uuid,
                      status: Reactium.Content.STATUS.DELETED.value,
                  })
                : await Reactium.Content.delete({
                      type,
                      uuid,
                  });

            icon = 'Feather.Check';

            toastType = Toast.TYPE.SUCCESS;

            message = isPurge
                ? __('Purged %title').replace(/%title/gi, title)
                : __('Deleted %title').replace(/%title/gi, title);
        } catch (err) {
            icon = 'Feather.X';

            toastType = Toast.TYPE.ERROR;

            message = _isPurge
                ? _('Unable to purge %title').replace(/%title/gi, title)
                : _('Unable to delete %title').replace(/%title/gi, title);

            console.log(err);
        }

        Toast.show({
            message,
            autoClose: 2500,
            type: toastType,
            icon: <Icon name={icon} />,
        });

        state.set('status', 'READY');

        return result;
    };

    const onPurge = (e) => {
        if (e.detail.uuid !== uuid) return;

        state.set('status', 'READY');
        state.set('confirmInput', null, false);

        const cancel = () => {
            Reactium.State.Tools.Modal.dismiss();
        };

        const confirm = () => {
            const i = String(state.get('confirmInput')).trim().toLowerCase();

            const m = String(state.get('confirmMatch')).trim().toLowerCase();

            if (i === m) {
                onDelete(e);
                Reactium.State.Tools.Modal.dismiss();
            } else {
                const input = refs.get('confirmed');
                if (input) input.select();
            }
        };

        return Reactium.State.Tools.Modal.show(
            <ConfirmBox
                key={e.detail.uuid}
                onCancel={cancel}
                onConfirm={confirm}
                title={__('Purge Content')}
                message={
                    <ConfirmMessage
                        state={state}
                        ref={(elm) => refs.set('confirmed', elm)}
                    />
                }
            />,
        ).then(() => {
            const input = refs.get('confirmed');
            if (input) input.focus();
        });
    };

    useEffect(() => {
        handle.addEventListener('content-delete', onDelete);
        handle.addEventListener('content-purge', onPurge);
        return () => {
            handle.removeEventListener('content-delete', onDelete);
            handle.removeEventListener('content-purge', onPurge);
        };
    }, []);

    return (
        <div className={isStatus('PENDING') ? 'delete-visible' : 'delete'}>
            {isStatus('PENDING') ? (
                <button disabled {...tip}>
                    <Icon name={'Linear.Sync'} className='spin' />
                </button>
            ) : (
                <button {...tip} onClick={onClick}>
                    <Icon
                        name={
                            status === Reactium.Content.STATUS.DELETED.value
                                ? 'Linear.Recycle'
                                : 'Feather.Trash2'
                        }
                    />
                </button>
            )}
        </div>
    );
};

const ConfirmMessage = forwardRef(({ state, ...props }, ref) => (
    <div className='form-group'>
        <div className='mb-xs-12'>
            {__('Enter')} "{state.get('confirmMatch')}" {__('below')}
        </div>
        <input
            ref={ref}
            {...props}
            type='text'
            className='text-center'
            placeholder={state.get('confirmMatch')}
            onChange={(e) => state.set('confirmInput', e.target.value, false)}
        />
        <small>{__('Purging content cannot be undone')}</small>
    </div>
));

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

export const ListItem = ({ registry, ...initialProps }) => {
    const props = updatedObj(initialProps);

    const dispatch = useDispatcher({ props });

    const { className, idField, path, zone } = props;

    const [components, setComponents] = useState(registry.list);

    const filter = (str) => {
        const z = String(props.cx(`${zone}-${str}`)).toLowerCase();
        return _.sortBy(
            components.filter((item) => item.zones.includes(z)),
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
                className={props.cx('item-info')}
            >
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
                        className={props.cx('item-actions-child')}
                    >
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
