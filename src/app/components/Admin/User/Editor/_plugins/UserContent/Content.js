import _ from 'underscore';
import op from 'object-path';
import pluralize from 'pluralize';
import React, { useCallback, useState } from 'react';
import Reactium, { __, useAsyncEffect } from 'reactium-core/sdk';
import { Button, Carousel, Icon, Slide } from '@atomic-reactor/reactium-ui';

const Content = ({ editor, data }) => {
    const { cx } = editor;

    const [types, setTypes] = useState();

    const getTypes = refresh => Reactium.ContentType.types(refresh);

    const isEmpty = () => _.isEmpty(data);

    const isVisible = () => {
        return !isEmpty() && types;
    };

    useAsyncEffect(async mounted => {
        if (!types) {
            const response = await getTypes();
            if (mounted()) {
                setTypes(
                    _.chain(
                        response.map(item => {
                            const { icon, label } = op.get(item, 'meta');

                            if (!icon || !label) return null;

                            const objectId = op.get(item, 'objectId');
                            const type = op.get(item, 'type');
                            const group = pluralize(type);
                            const addURL = `/admin/content/${type}/new`;
                            const listURL = `/admin/content/${group}/page/1`;

                            return {
                                group,
                                icon,
                                label,
                                objectId,
                                addURL,
                                listURL,
                            };
                        }),
                    )
                        .compact()
                        .indexBy('objectId')
                        .value(),
                );
            }
        }
        return () => {};
    });

    const getCount = contentType => {
        if (contentType) {
            return Object.values(op.get(data, [contentType], {})).length;
        }

        const count = {};

        Object.entries(data).forEach(([key, value]) => {
            const type = op.get(types, key);
            if (!type) return;
            count[key] = Object.values(value).length;
        });

        return count;
    };

    const stats = () => {
        let list = Object.values(types).map(type => {
            type = JSON.parse(JSON.stringify(type));
            op.set(type, 'count', getCount(type.objectId));
            return type;
        });

        list = _.sortBy(list, 'label');
        list = _.sortBy(list, 'count');

        list.reverse();

        return _.chunk(list, 4);
    };

    const Stat = useCallback(item => {
        const { count = 0, group, icon, addURL, listURL } = item;
        return (
            <div className={cx('content-stat')}>
                <div className={cx('content-stat-label')}>
                    <span className='flex-grow'>{group}</span>
                    <span className={cx('content-stat-icon')}>
                        <Icon name={icon} />
                    </span>
                </div>
                <div className={cx('content-stat-count')}>{count}</div>
            </div>
        );
    });

    const render = () => (
        <>
            <div className={cx('content-stats')}>
                <div className='ar-carousel'>
                    {stats().map((chunk, i) => (
                        <div className='ar-carousel-slide' key={`slide-${i}`}>
                            {chunk.map((item, k) => (
                                <Stat key={`stat-${k}`} {...item} />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className={cx('content-list')}>
                {Object.entries(data).map(([key, value]) => {
                    const type = op.get(types, key);
                    if (!type) return null;

                    const items = Object.values(value);
                    const { addURL, group, listURL } = type;

                    return (
                        <div key={key} className={cx('content-list-item')}>
                            <h3>{group}</h3>
                        </div>
                    );
                })}
            </div>
        </>
    );

    return isVisible() ? render() : null;
};

export { Content, Content as default };
