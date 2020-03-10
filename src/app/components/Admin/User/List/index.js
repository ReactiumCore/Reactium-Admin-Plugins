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
    useSelect,
    Zone,
} from 'reactium-core/sdk';

import { useProfileAvatar } from 'components/Admin/Profile/hooks';

const ENUMS = {
    STATUS: {
        INIT: 'INIT',
        FETCHING: 'FETCHING',
        READY: 'READY',
    },
};

const UserList = ({ className, id, namespace, ...props }) => {
    // SearchBar
    const SearchBar = useHandle('SearchBar');

    const search = useSelect(state => op.get(state, 'SearchBar.value'));

    try {
        SearchBar.setState({ visible: true });
    } catch (err) {}

    const containerRef = useRef();

    const urlParams = useSelect(state => op.get(state, 'Router.params'));

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = () => cn(cx(), { [className]: !!className });

    const fetch = params => {
        if (state.req) return state.req;
        const req = Reactium.User.list(params);
        setState({ status: ENUMS.STATUS.FETCHING, users: undefined, req });
        return req;
    };

    const [prevState, setPrevState] = useDerivedState({
        page: op.get(urlParams, 'page', 1),
        search,
        status: ENUMS.STATUS.INIT,
    });

    const [state, setNewState] = useDerivedState({
        page: op.get(urlParams, 'page', 1),
        pages: undefined,
        req: undefined,
        search,
        status: ENUMS.STATUS.INIT,
        users: undefined,
    });

    const setState = newState => {
        if (unMounted()) return;
        setPrevState(JSON.parse(JSON.stringify(state)));
        setNewState(newState);
    };

    const getName = user => {
        const fname = op.get(user, 'fname', op.get(user, 'firstName'));
        const lname = op.get(user, 'lname', op.get(user, 'lastName'));
        const uname = op.get(user, 'username');
        let name = _.compact([fname, lname]).join(' ');
        return String(name).length < 1 ? uname : name;
    };

    const getUsers = (fetchParams, mounted) => {
        if (isBusy()) return;
        fetch(fetchParams).then(({ results: users, ...params }) => {
            if (!mounted()) return;
            setState({
                ...params,
                users,
                req: undefined,
                status: ENUMS.STATUS.READY,
            });
        });
    };

    const isBusy = () =>
        Boolean(state.req || state.status !== ENUMS.STATUS.READY);

    const isMounted = () => !!containerRef.current;

    const unMounted = () => !containerRef.current;

    const _onSearch = newSearch => {
        newSearch =
            newSearch !== null && newSearch.length < 1 ? null : newSearch;
        setState({ search: newSearch });
    };

    const onSearch = _.throttle(_onSearch, 125, { leading: false });

    const _onInit = () => {
        if (state.status === ENUMS.STATUS.INIT) {
            fetch({ page: state.page }).then(({ results: users, ...params }) =>
                setState({
                    ...params,
                    users,
                    req: undefined,
                    status: ENUMS.STATUS.READY,
                }),
            );
        }
    };

    const initialize = _.once(_onInit);

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

    useEffect(() => {
        if (isBusy() || state.status === ENUMS.STATUS.INIT) return;
        if (state.search !== search) {
            onSearch(search);
        }
    }, [search]);

    // Fetch users on state changes
    useAsyncEffect(
        async mounted => {
            if (isBusy()) return;

            const fields = ['search', 'page'];
            const newFetchParams = {};

            fields.forEach(fld => {
                let curr = op.get(state, fld);
                let prev = op.get(prevState, fld);

                if (_.isNumber(curr)) prev = Number(prev);

                if (curr === prev) return;
                newFetchParams[fld] = op.get(state, fld);
            });

            if (Object.keys(newFetchParams).length < 1) return () => {};

            fetch(newFetchParams).then(({ results: users, ...params }) => {
                setState({
                    ...params,
                    users,
                    req: undefined,
                    status: ENUMS.STATUS.READY,
                });
            });

            //getUsers(newFetchParams, mounted);
            return () => {};
        },
        [Object.values(state)],
    );

    useEffect(() => {
        const newHandle = _handle();
        if (_.isEqual(newHandle, handle)) return;
        setHandle(newHandle);
    }, [Object.values(state), containerRef.current]);

    useEffect(() => {
        initialize();
    }, [state.page]);

    const render = () => {
        return (
            <div className={cname()} ref={containerRef}>
                {state.users && (
                    <div className={cx('row')}>
                        {state.users.map(item => (
                            <div
                                key={`user-${item.objectId}`}
                                className={cn(cx('column'), {
                                    current: Reactium.User.isCurrent(item),
                                })}>
                                <Link
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

                                    <div className={cx('card-role')}>
                                        {getRole(item)}
                                    </div>

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
                )}
                {isBusy() && <PlaceHolder {...handle} />}
                {isBusy() && <Spinner className={cx('spinner')} />}
            </div>
        );
    };

    return render();
};

const getRole = user => {
    const roles = Object.entries(op.get(user, 'roles', {})).map(
        ([role, level]) => ({
            role,
            level,
        }),
    );

    const role = _.chain(roles)
        .sortBy('level')
        .value()
        .pop();

    return op.get(role, 'role', 'anonymous');
};

const Avatar = ({ className, user }) => {
    //const image = op.get(user, 'avatar', '/assets/images/avatar.png');
    const image = useProfileAvatar(user);

    return (
        <div
            className={className}
            style={{ backgroundImage: `url(${image})` }}
        />
    );
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
