import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import copy from 'copy-to-clipboard';
import { Link } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';
import {
    Button,
    Collapsible,
    Icon,
    Spinner,
} from '@atomic-reactor/reactium-ui';

import Reactium, {
    __,
    useAsyncEffect,
    useDerivedState,
    useEventHandle,
    useHandle,
    useRegisterHandle,
    useRoles,
    useSelect,
    Zone,
} from 'reactium-core/sdk';

import { useProfileRole } from 'components/Admin/Profile/hooks';

import useAvatar from '../useAvatar';

const ENUMS = {
    STATUS: {
        INIT: 'INIT',
        FETCHING: 'FETCHING',
        READY: 'READY',
    },
};

const UserList = ({
    className,
    id,
    namespace,
    page: initialPage,
    ...props
}) => {
    // SearchBar
    const SearchBar = useHandle('SearchBar');
    SearchBar.setState({ visible: true });
    const search = useSelect(state => op.get(state, 'SearchBar.value'));

    const containerRef = useRef();

    const urlParams = useSelect(state => op.get(state, 'Router.params'));

    const [prevState, setPrevState] = useDerivedState({
        page: op.get(urlParams, 'page', 1),
        search,
        status: ENUMS.STATUS.INIT,
    });

    const [state, setNewState] = useDerivedState({
        page: initialPage || op.get(urlParams, 'page', 1),
        pages: undefined,
        req: undefined,
        role: undefined,
        roleLabel: undefined,
        search,
        order: 'ascending',
        status: ENUMS.STATUS.INIT,
        users: undefined,
    });

    const setState = newState => {
        if (unMounted()) return;
        setPrevState(JSON.parse(JSON.stringify(state)));
        setNewState(newState);
    };

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = () => cn(cx(), { [className]: !!className });

    const fetch = params => {
        if (state.req) return state.req;
        const req = Reactium.User.list(params);
        setState({ status: ENUMS.STATUS.FETCHING, users: undefined, req });
        return req;
    };

    const getName = user => {
        const fname = op.get(user, 'fname', op.get(user, 'firstName'));
        const lname = op.get(user, 'lname', op.get(user, 'lastName'));
        const uname = op.get(user, 'username');
        let name = _.compact([fname, lname]).join(' ');
        return String(name).length < 1 ? uname : name;
    };

    const getData = fetchParams =>
        fetch(fetchParams).then(({ results: users, ...params }) => {
            if (unMounted()) return;

            const { page, pages } = params;

            if (page > pages) {
                setState({
                    page: pages,
                    req: undefined,
                    status: ENUMS.STATUS.READY,
                });
                Reactium.Routing.history.push('/admin/users/page/1');
            } else {
                setState({
                    ...params,
                    users,
                    req: undefined,
                    status: ENUMS.STATUS.READY,
                });
            }
        });

    const isBusy = () =>
        Boolean(state.req || state.status !== ENUMS.STATUS.READY);

    const isMounted = () => !!containerRef.current;

    const unMounted = () => !containerRef.current;

    const onSearch = newSearch => {
        if (
            newSearch !== null &&
            String(newSearch).length > 0 &&
            String(newSearch).length < 3
        ) {
            return;
        }

        newSearch =
            newSearch !== null && String(newSearch).length < 1
                ? null
                : newSearch;

        if (unMounted()) return;

        setState({ search: newSearch });
    };

    const onInitialize = () => {
        Reactium.User.selected = null;

        if (state.status === ENUMS.STATUS.INIT) {
            getData({ page: state.page, order: state.order });
        }

        return () => {};
    };

    const initialize = _.once(onInitialize);

    const _handle = () => ({
        cx,
        fetch,
        isBusy,
        isMounted,
        setState,
        state,
        unMounted,
    });

    const [handle, setHandle] = useEventHandle(_handle());

    useRegisterHandle(id, () => handle, [handle]);

    // Search changed
    useEffect(() => {
        if (isBusy() || state.status === ENUMS.STATUS.INIT) return;
        if (state.search !== search) {
            onSearch(search);
        }
    }, [search]);

    // Fetch users on search, page, role, order change
    useAsyncEffect(
        async mounted => {
            if (isBusy()) return;

            const oldFetchParams = {};
            const newFetchParams = {};
            const fields = ['page', 'role', 'search', 'order'];

            fields.forEach(fld => {
                let curr = op.get(state, fld);
                let prev = op.get(prevState, fld);

                oldFetchParams[fld] = prev;

                if (_.isNumber(curr)) prev = Number(prev);

                if (curr === prev) return;
                newFetchParams[fld] = op.get(state, fld);
            });

            if (Object.keys(newFetchParams).length > 0) {
                const fetchParams = { ...oldFetchParams, ...newFetchParams };
                getData(fetchParams);
            }

            return () => {};
        },
        [Object.values(state)],
    );

    // Update handle
    useEffect(() => {
        const newHandle = _handle();
        if (_.isEqual(newHandle, handle)) return;
        setHandle(newHandle);
    }, [Object.values(state), containerRef.current]);

    // Update route on state.page changed
    useEffect(() => {
        if (state.page !== op.get(urlParams, 'page')) {
            Reactium.Routing.history.push(`/admin/users/page/${state.page}`);
        }
    }, [state.page]);

    // Initialize
    useEffect(initialize, [state.page]);

    const render = () => (
        <div className={cname()} ref={containerRef}>
            <Header list={handle} search={search} />
            <Zone list={handle} zone={cx('top')} />
            <div className={cx('row')}>
                {state.users &&
                    state.users.map(item => (
                        <div
                            key={`user-${item.objectId}`}
                            className={cn(cx('column'), {
                                current: Reactium.User.isCurrent(item),
                            })}>
                            <Link
                                onClick={() => (Reactium.User.selected = item)}
                                to={`/admin/user/${item.objectId}`}
                                className={cn(cx('card'), 'link')}>
                                <Avatar
                                    user={item}
                                    className={cx('card-avatar')}
                                    unMounted={unMounted}
                                />
                                <span className={cx('card-title')}>
                                    {getName(item)}
                                </span>

                                <Role className={cx('card-role')} user={item} />

                                {item.email && (
                                    <span className={cx('card-email')}>
                                        {op.get(item, 'email')}
                                    </span>
                                )}

                                <Zone
                                    list={handle}
                                    user={item}
                                    zone={cx('item')}
                                />
                            </Link>

                            <div className={cx('item-actions-left')}>
                                <Button
                                    color={Button.ENUMS.COLOR.CLEAR}
                                    type={Button.ENUMS.TYPE.LINK}
                                    onClick={() =>
                                        (Reactium.User.selected = item)
                                    }
                                    to={`/admin/user/${item.objectId}/edit`}>
                                    <Icon name='Feather.Edit2' size={16} />
                                </Button>
                                <Zone
                                    list={handle}
                                    user={item}
                                    zone={cx('item-actions-left')}
                                />
                            </div>

                            <div className={cx('item-actions-right')}>
                                <Zone
                                    list={handle}
                                    user={item}
                                    zone={cx('item-actions-right')}
                                />
                            </div>
                        </div>
                    ))}
            </div>
            <Zone list={handle} zone={cx('bottom')} />
            {isBusy() && <Spinner className={cx('spinner')} />}
        </div>
    );

    return render();
};

const Avatar = ({ className, user }) => {
    const [avatar] = useAvatar(user);
    return (
        <div
            className={className}
            style={{ backgroundImage: `url(${avatar})` }}
        />
    );
};

const Role = ({ className, user }) => {
    const role = useProfileRole(user);
    return <div className={className}>{role}</div>;
};

const PlaceHolder = ({ cx }) => (
    <div className={cx('row')}>
        {_.times(12, index => (
            <div key={`placeholder-${index}`} className={cx('column')}>
                <div className={cn(cx('card'), 'placeholder')}>
                    <div className={cn(cx('card-avatar'), 'placeholder')} />
                    <span className={cn(cx('card-title'), 'placeholder')} />
                    <div className={cn(cx('card-role'), 'placeholder')} />
                    <span className={cn(cx('card-email'), 'placeholder')} />
                </div>
            </div>
        ))}
    </div>
);

const Header = ({ list }) => {
    const { cx, state } = list;
    const { count, role, roleLabel, search, users } = state;
    const countLabel = count ? `${count} ` : 'No';
    let label = count !== 1 ? __('Users') : __('User');

    if (search) {
        label =
            count !== 1 ? __('search results for ') : __('search result for ');
    }

    return !users ? (
        <div className={cx('heading')} />
    ) : (
        <div className={cx('heading')}>
            {search && (
                <h2>
                    <span className={cx('heading-count')}>{countLabel}</span>
                    {label}
                    <span className='blue'>{search}</span>
                </h2>
            )}
            {!search && (
                <h2>
                    <span className={cx('heading-count')}>{countLabel}</span>
                    {role && <span className='blue'>{roleLabel} </span>}
                    {label}
                </h2>
            )}
            <div className={cx('toolbar')}>
                <Zone list={list} zone={cx('toolbar')} />
            </div>
        </div>
    );
};

UserList.defaultProps = {
    namespace: 'admin-user-list',
};

const EmailWidget = ({ user }) => {
    const { email } = user;

    const tools = useHandle('AdminTools');

    const Toast = op.get(tools, 'Toast');

    const onClick = () => {
        copy(email);
        Toast.show({
            icon: 'Linear.EnvelopeOpen',
            message: `${email} ${__('copied to clipboard')}`,
            type: Toast.TYPE.INFO,
        });
    };

    const buttonProps = {
        height: 40,
        padding: 0,
    };

    return (
        <Button
            block
            color={Button.ENUMS.COLOR.CLEAR}
            onClick={onClick}
            style={buttonProps}>
            <Icon name='Linear.EnvelopeOpen' size={16} />
        </Button>
    );
};

const ListWidgets = ({ user, list }) => {
    const ref = useRef();

    const toggle = () => ref.current.toggle();

    const buttonProps = {
        height: 40,
        padding: 0,
    };

    return (
        <div>
            <Button
                block
                color={Button.ENUMS.COLOR.CLEAR}
                onClick={toggle}
                style={buttonProps}>
                <Icon name='Feather.MoreVertical' size={16} />
            </Button>
            <Collapsible ref={ref} expanded={false}>
                <Zone
                    zone={list.cx('item-actions')}
                    user={user}
                    list={list}
                    collapsible={ref}
                />
            </Collapsible>
        </div>
    );
};

export { UserList as default, EmailWidget, ListWidgets };
