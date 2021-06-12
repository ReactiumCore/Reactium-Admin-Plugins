import _ from 'underscore';
import cn from 'classnames';
import ENUMS from './enums';
import op from 'object-path';
import { Scrollbars } from 'react-custom-scrollbars';
import moment from 'moment';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

import Reactium, {
    __,
    useEventHandle,
    useHookComponent,
    useReduxState,
} from 'reactium-core/sdk';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: ActivityUpdates
 * -----------------------------------------------------------------------------
 */
const ChangeItem = props => {
    const { Icon } = useHookComponent('ReactiumUI');

    const item = op.get(props, 'item');
    const scope = op.get(props, 'scope', 'specific');
    const users = _.indexBy(
        op.get(Reactium.Cache.get('acl-targets'), 'users'),
        'objectId',
    );

    const cx = Reactium.Utils.cxFactory('activity-list');
    const getDescriptionParts = (who, changeType, meta) => {
        const parts = Reactium.Utils.splitParts(
            op.get(
                ENUMS.CHANGES,
                [changeType, scope],
                ENUMS.CHANGES.DEFAULT[scope],
            ),
        );

        switch (changeType) {
            case 'SLUG_CHANGED': {
                parts.replace('originalSlug', op.get(meta, 'originalSlug', ''));
                break;
            }
            case 'LABELED_BRANCH': {
                const branchLabel = op.get(meta, 'branchLabel');
                parts.replace('version', branchLabel);
                break;
            }
            case 'REVISED':
            case 'CREATED_BRANCH':
            case 'SET_REVISION': {
                const { branch, revision } = op.get(meta, 'history');
                const label = op.get(meta, 'branch.label', branch);
                const rev = revision !== undefined ? ` v${revision + 1}` : '';
                const version = `${label}${rev}`;
                parts.replace('version', version);
                break;
            }
            case 'DELETED_BRANCH': {
                const deleted = op.get(meta, 'branch.label');
                parts.replace('deleted', deleted);
                break;
            }
            case 'SET_STATUS': {
                parts.replace('status', op.get(meta, 'status', ''));
                break;
            }
            default: {
                parts.replace('changetype', changeType);
                break;
            }
        }

        // who
        parts.replace('who', who ? who : __('Unknown'));
        parts.replace('slug', op.get(meta, 'slug', ''));
        parts.replace(
            'type',
            op.get(meta, 'type.objectId', op.get(meta, 'type', '')),
        );
        parts.replace('uuid', op.get(meta, 'uuid', ''));

        return parts.value();
    };

    const renderParts = (who, changeType, meta) =>
        getDescriptionParts(who, changeType, meta).map(
            ({ key, value, type }) => {
                return (
                    <span
                        key={key}
                        className={cn(cx('item-part'), {
                            [key]: type !== 'part',
                        })}>
                        {value}
                    </span>
                );
            },
        );

    const renderItem = item => {
        const { userId, changeType, meta, updatedAt } = item;
        const who = op.get(users, [userId, 'username']);
        const when = moment(updatedAt).fromNow();

        return (
            <li
                className={cx(
                    'item',
                    `item-${changeType.toLowerCase().replace('_', '-')}`,
                )}>
                <div className={cx('item-description')}>
                    {renderParts(who, changeType, meta)}
                </div>
                <div className={cx('item-when')}>
                    <Icon name='Linear.CalendarFull' /> <span>{when}</span>
                </div>
            </li>
        );
    };

    return renderItem(item);
};

let ActivityUpdates = (props, ref) => {
    const containerRef = useRef();

    let { className, header, log = [], scope = 'specific' } = props;

    log = Array.isArray(log)
        ? _.sortBy(log, 'updatedAt').reverse()
        : _.sortBy(Object.values(log), 'updatedAt').reverse();

    const _handle = () => ({
        Container: containerRef,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle, [handle]);

    return (
        <div
            className={cn('activity-log-updates', className)}
            ref={containerRef}>
            <h2 className='activity-list-header h6'>{header}</h2>
            <div className='activity-list-container'>
                <Scrollbars>
                    <ul className='activity-list'>
                        {log.map(item => (
                            <ChangeItem
                                key={item.objectId}
                                item={item}
                                scope={scope}
                            />
                        ))}
                    </ul>
                </Scrollbars>
            </div>
        </div>
    );
};

ActivityUpdates = forwardRef(ActivityUpdates);

ActivityUpdates.defaultProps = {
    className: 'col-xs-12 col-md-4 col-lg-2',
    header: ENUMS.HEADER,
    log: [],
    scope: 'specific',
};

export default ActivityUpdates;
