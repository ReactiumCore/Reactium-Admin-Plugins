import _ from 'underscore';
import cn from 'classnames';
import ENUMS from '../enums';
import op from 'object-path';
import IconImg from './IconImg';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Icon } from '@atomic-reactor/reactium-ui';
import useProperCase from 'components/Admin/Tools/useProperCase';
import useRouteParams from 'components/Admin/Tools/useRouteParams';

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
    useDerivedState,
    useEventHandle,
    useHandle,
    useRegisterHandle,
    useSelect,
    useHookComponent,
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
    // Refs
    const containerRef = useRef();
    const status = useRef('init');

    // Components
    const Helmet = useHookComponent('Helmet');
    const SearchBar = useHandle('SearchBar');

    // Search
    const search = useSelect(state => op.get(state, 'SearchBar.value'));

    // State
    const [state, updateState] = useDerivedState({
        title: ENUMS.TEXT.TITLE,
        types: [],
        updated: null,
    });

    const setState = newState => {
        if (unMounted()) return;
        updateState(newState);
    };

    const setStatus = newStatus => {
        status.current = newStatus;
    };
    const setTitle = title => setState({ title });
    const setTypes = types => setState({ types });
    const update = updated => setState({ updated });

    const cx = cls => _.compact([namespace, cls]).join('-');

    const cname = cn({ [cx()]: true, [className]: !!className });

    const filter = () => {
        const { types } = state;
        if (!search || types.length < 1) return types;

        const s = String(search).toLowerCase();
        return types.filter(({ meta }) =>
            String(op.get(meta, 'label', ''))
                .toLowerCase()
                .startsWith(s),
        );
    };

    const isEmpty = () => Boolean(state.types.length < 1);

    const getTypes = refresh => Reactium.ContentType.types({ refresh });

    const properCase = useProperCase();

    const unMounted = () => !containerRef.current;

    const _handle = () => ({
        types: state.types,
        cx,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useImperativeHandle(ref, () => handle);

    useRegisterHandle('AdminContentTypeList', () => handle);

    // Get content types
    useAsyncEffect(
        async mounted => {
            if (status.current !== 'init') return;
            setStatus('fetching');
            const types = await getTypes(true);
            if (mounted()) {
                setStatus('ready');
                setState({ types });
            }
            return Reactium.Cache.subscribe('content-types', async ({ op }) => {
                if (['set', 'del'].includes(op) && mounted() === true) {
                    update(Date.now());
                }
            });
        },
        [state.status],
    );

    // Show SearchBar
    useEffect(() => {
        if (!SearchBar) return;
        const { types } = state;
        const { visible } = SearchBar.state;
        if (visible !== true && types.length > 0) {
            SearchBar.setState({ visible: true });
        }
    }, [SearchBar, state.types]);

    const render = () => {
        const empty = isEmpty();
        return (
            <>
                <Helmet>
                    <title>{properCase(state.title)}</title>
                </Helmet>
                <div className={cname} ref={containerRef}>
                    <div className={cx('content')}>
                        {empty && status.current === 'ready' && <Empty />}
                        {!empty && status.current === 'ready' && (
                            <Zone zone={cx('top')} />
                        )}
                        {!empty &&
                            status.current === 'ready' &&
                            filter().map(({ meta, uuid }) => {
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

const Empty = () => (
    <div className='admin-content-type-list-empty'>
        <IconImg />
        <Button
            appearance={Button.ENUMS.APPEARANCE.PILL}
            className='hide-xs show-md'
            size={Button.ENUMS.SIZE.LG}
            type={Button.ENUMS.TYPE.LINK}
            to='/admin/type/new'>
            {__('New Content Type')}
        </Button>
        <Button
            appearance={Button.ENUMS.APPEARANCE.PILL}
            className='hide-md'
            size={Button.ENUMS.SIZE.MD}
            type={Button.ENUMS.TYPE.LINK}
            to='/admin/type/new'>
            {__('New Content Type')}
        </Button>
    </div>
);

ContentTypeList = forwardRef(ContentTypeList);

ContentTypeList.propTypes = {
    className: PropTypes.string,
    namespace: PropTypes.string,
};

ContentTypeList.defaultProps = {
    namespace: 'admin-content-type-list',
};

export default ContentTypeList;
