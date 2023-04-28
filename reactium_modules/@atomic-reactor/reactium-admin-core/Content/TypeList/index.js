import cn from 'classnames';
import Empty from './Empty';
import ListItem from './ListItem';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Reactium, {
    __,
    useHookComponent,
    useRefs,
    Zone,
} from 'reactium-core/sdk';

const ContentTypeList = ({ className, namespace, title }) => {
    const refs = useRefs();

    const Helmet = useHookComponent('Helmet');

    const [types] = useHookComponent('useContentTypes')(false);

    const filter = useCallback(() => types, [types]);

    const isEmpty = useCallback(
        () => Boolean(types !== false && types.length < 1),
        [types],
    );

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = cn({ [cx()]: true, [className]: !!className });

    return types === false ? null : (
        <div className={cname} ref={elm => refs.set('container', elm)}>
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
