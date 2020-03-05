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

    const mapParts = (parts, key, value) => {
        const search = `%${key}%`;
        if (typeof parts === 'string' && parts.includes(search)) {
            parts = parts.replace(search, '|FOUND_IT|');
            return _.compact(
                parts.split('|').map(part => {
                    if (part === 'FOUND_IT')
                        return {
                            type: key,
                            [key]: value,
                        };

                    if (part === '') return;

                    return part;
                }),
            );
        } else if (Array.isArray(parts)) {
            return _.flatten(parts.map(part => mapParts(part, key, value)));
        } else {
            return parts;
        }
    };

    const getDescriptionParts = (who, changeType, meta) => {
        const description = ENUMS.CHANGES[changeType].description;
        let parts = description;
        switch (changeType) {
            case 'SLUG_CHANGED': {
                const slug = op.get(meta, 'slug', '');
                parts = mapParts(parts, 'slug', slug);
                break;
            }
            case 'SET_REVISION': {
                const { branch, revision } = op.get(meta, 'history');
                const rev = revision !== undefined ? ` v${revision + 1}` : '';
                const version = `${branch}${rev}`;
                console.log({ version });
                parts = mapParts(parts, 'version', version);
                console.log({ parts });
                break;
            }
            case 'SET_STATUS': {
                const status = op.get(meta, 'status', '');
                parts = mapParts(parts, 'status', status);
                break;
            }
        }

        // who
        parts = mapParts(parts, 'who', who);
        return parts;
    };

    const renderParts = (who, changeType, meta) =>
        getDescriptionParts(who, changeType, meta).map(part => {
            if (typeof part === 'string') {
                return (
                    <span key={part} className={cx('item-part')}>
                        {part}
                    </span>
                );
            }

            if (typeof part === 'object') {
                return (
                    <span
                        key={part.type}
                        className={cn(cx('item-part'), part.type)}>
                        {part[part.type]}
                    </span>
                );
            }

            return null;
        });

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
