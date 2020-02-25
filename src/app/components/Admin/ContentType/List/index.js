import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import IconImg from './IconImg';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import useProperCase from 'components/Admin/Content/_utils/useProperCase';
import useRouteParams from 'components/Admin/Content/_utils/useRouteParams';

import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import Reactium, {
    __,
    useAsyncEffect,
    useEventHandle,
    useHandle,
    useRegisterHandle,
    useSelect,
    Zone,
} from 'reactium-core/sdk';

const Card = ({ handle, Ico, label, id }) => (
    <Link
        className={handle.cx('card')}
        to={`/admin/type/${id}`}
        title={`${ENUMS.TEXT.EDIT} ${label}`}>
        <Ico />
        <h3 className={handle.cx('label')}>{label}</h3>
    </Link>
);

let ContentTypeList = ({ className, namespace, ...props }, ref) => {
    const search = useSelect(state => op.get(state, 'SearchBar.value'));
    const SearchBar = useHandle('SearchBar');

    const [title, setTitle] = useState(ENUMS.TEXT.TITLE);
    const [types, setTypes] = useState([]);
    const [updated, update] = useState();

    const cx = cls => _.compact([namespace, cls]).join('-');

    const cname = cn({ [cx()]: true, [className]: !!className });

    const filter = () => {
        if (!search || types.length < 1) return types;

        const s = String(search).toLowerCase();
        return types.filter(({ meta }) =>
            String(op.get(meta, 'label', ''))
                .toLowerCase()
                .startsWith(s),
        );
    };

    const getTypes = refresh => Reactium.ContentType.types(refresh);

    const properCase = useProperCase();

    const _handle = () => ({
        types,
        cx,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useRegisterHandle('AdminContentTypeList', () => handle);

    // Get content types
    useAsyncEffect(
        async mounted => {
            if (types.length > 0) return;
            const results = await getTypes(true);
            if (mounted()) setTypes(results);
            return Reactium.Cache.subscribe('content-types', async ({ op }) => {
                if (['set', 'del'].includes(op) && mounted() === true) {
                    update(Date.now());
                }
            });
        },
        [types],
    );

    // Show SearchBar
    useEffect(() => {
        if (!SearchBar) return;
        const { visible } = SearchBar.state;
        if (visible !== true && types.length > 0) {
            SearchBar.setState({ visible: true });
        }
    }, [SearchBar, types]);

    const render = () => {
        return (
            <>
                <Helmet>
                    <title>{properCase(title)}</title>
                </Helmet>
                <div className={cname}>
                    <div className={cx('content')}>
                        <Zone zone={cx('top')} />
                        {filter().map(({ meta, uuid }) => {
                            const { label, icon } = meta;
                            if (!label) return;
                            const Ico = icon
                                ? () => (
                                      <div className={cx('icon')}>
                                          <Icon name={icon} />
                                      </div>
                                  )
                                : () => (
                                      <div className={cx('graphic')}>
                                          <IconImg />
                                      </div>
                                  );
                            return (
                                <Card
                                    key={uuid}
                                    id={uuid}
                                    handle={handle}
                                    label={label}
                                    Ico={Ico}
                                />
                            );
                        })}
                        <Zone zone={cx('bottom')} />
                    </div>
                </div>
            </>
        );
    };

    return render();
};

ContentTypeList = forwardRef(ContentTypeList);

ContentTypeList.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

ContentTypeList.defaultProps = {
    namespace: 'admin-content-type-list',
};

export default ContentTypeList;
