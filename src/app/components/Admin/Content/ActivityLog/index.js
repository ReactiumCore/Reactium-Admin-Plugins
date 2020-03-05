import React from 'react';
import Reactium, { useReduxState } from 'reactium-core/sdk';
import { Icon } from '@atomic-reactor/reactium-ui';
import _ from 'underscore';
import op from 'object-path';
import cn from 'classnames';
import domain from './domain';
import ENUMS from './enums';

/**
 * -----------------------------------------------------------------------------
 * Functional Component: Activity
 * -----------------------------------------------------------------------------
 */
const ChangeItem = props => {
    const item = op.get(props, 'item');
    const users = _.indexBy(
        op.get(Reactium.Cache.get('acl-targets'), 'users'),
        'objectId',
    );
    const cx = Reactium.Utils.cxFactory('activity-list');
    const getDescriptionParts = (who, changeType, meta) => {
        const parts = Reactium.Utils.splitParts(
            ENUMS.CHANGES[changeType].description,
        );

        switch (changeType) {
            case 'SLUG_CHANGED': {
                const slug = op.get(meta, 'slug', '');
                parts.replace('slug', slug);
                break;
            }
            case 'REVISED':
            case 'SET_REVISION': {
                const { branch, revision } = op.get(meta, 'history');
                const rev = revision !== undefined ? ` v${revision + 1}` : '';
                const version = `${branch}${rev}`;
                parts.replace('version', version);
                break;
            }
            case 'SET_STATUS': {
                const status = op.get(meta, 'status', '');
                parts.replace('status', status);
                break;
            }
        }

        // who
        parts.replace('who', who);
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

const Activity = props => {
    const [activity] = useReduxState(domain.name);
    const log = _.sortBy(
        Object.values(op.get(activity, 'log', {})),
        'updatedAt',
    ).reverse();

    return (
        <div className='activity-log'>
            <div className='activity-log-chart col-xs-12 col-md-8 col-lg-10'>
                {
                    // <img
                    // src='https://cdn.reactium.io/activity-comp.png'
                    // style={{
                    //     width: '100%',
                    // }}
                    // />
                }
            </div>
            <div className='activity-log-updates col-xs-12 col-md-4 col-lg-2'>
                <h2 className='activity-list-header h6'>{ENUMS.HEADER}</h2>
                <ul className='activity-list'>
                    {log.map(item => (
                        <ChangeItem key={item.objectId} item={item} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Activity;
