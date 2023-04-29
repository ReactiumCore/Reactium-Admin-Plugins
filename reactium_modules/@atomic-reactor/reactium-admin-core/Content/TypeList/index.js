import cn from 'classnames';
import Empty from './Empty';
import op from 'object-path';
import PropTypes from 'prop-types';
import { ListItem } from './ListItem';
import { Spinner } from 'reactium-ui';
import React, { useCallback, useState } from 'react';
import {
    __,
    cxFactory,
    useHookComponent,
    useStateEffect,
    Zone,
} from 'reactium-core/sdk';

const ContentTypeList = ({ className, namespace, title }) => {
    const Helmet = useHookComponent('Helmet');

    const [types] = useHookComponent('useContentTypes')(false);

    const [search, setSearch] = useState('');

    const filter = useCallback(() => {
        const matcher = item => {
            let match = String(op.get(item, 'meta.label', ''))
                .toLowerCase()
                .startsWith(search);

            match = !match
                ? String(op.get(item, 'machineName', ''))
                      .toLowerCase()
                      .startsWith(search)
                : match;
            return match;
        };

        return types.filter(matcher);
    }, [types, search]);

    const onSearch = useCallback(e => {
        setSearch(String(e.value || '').toLowerCase());
    }, []);

    const isEmpty = useCallback(
        () => Boolean(types !== false && types.length < 1),
        [types],
    );

    const cx = cxFactory(namespace);

    useStateEffect(
        {
            'admin-content-type-list-search': onSearch,
        },
        [],
    );

    return types === false ? (
        <Spinner className={cx('spinner')} />
    ) : (
        <div className={cn({ [cx()]: true, [className]: !!className })}>
            <Helmet>{title}</Helmet>
            <div className={cx('content')}>
                {isEmpty() ? (
                    <Empty />
                ) : (
                    <>
                        <Zone zone={cx('top')} />
                        {filter().map(item => (
                            <ListItem cx={cx} {...item} key={item.uuid} />
                        ))}
                        <Zone zone={cx('bottom')} />
                    </>
                )}
            </div>
        </div>
    );
};

ContentTypeList.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
    title: PropTypes.string,
};

ContentTypeList.defaultProps = {
    namespace: 'admin-content-type-list',
    title: __('Content Types'),
};

export default ContentTypeList;
