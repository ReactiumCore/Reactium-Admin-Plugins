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
import {
    useProfileAvatar,
    useProfileRole,
} from 'components/Admin/Profile/hooks';

import Reactium, {
    __,
    useDerivedState,
    useEventHandle,
    useHandle,
    useRegisterHandle,
    useSelect,
    Zone,
} from 'reactium-core/sdk';

const ENUMS = {
    STATUS: {
        INIT: 'INIT',
        FETCHING: 'FETCHING',
        READY: 'READY',
    },
};

const UserList = ({ className, id, namespace, ...props }) => {
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

    const [state, setNewState] = useDerivedState({
        page: op.get(urlParams, 'page', 1),
        pages: undefined,
        req: undefined,
        status: ENUMS.STATUS.INIT,
        users: undefined,
    });

    const setState = newState => {
        if (unMounted()) return;
        setNewState(newState);
    };

    const getName = user => {
        const fname = op.get(user, 'fname', op.get(user, 'firstName'));
        const lname = op.get(user, 'lname', op.get(user, 'lastName'));
        const uname = op.get(user, 'username');
        let name = _.compact([fname, lname]).join(' ');
        return String(name).length < 1 ? uname : name;
    };

    const isBusy = () => Boolean(!!state.req);

    const isMounted = () => !!containerRef.current;

    const unMounted = () => !containerRef.current;

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
    }, [state.page]);

    useEffect(() => {
        const newHandle = _handle();
        if (_.isEqual(newHandle, handle)) return;
        setHandle(newHandle);
    }, [state, containerRef.current]);

    const render = () => {
        return (
            <div className={cname()} ref={containerRef}>
                {state.users && (
                    <div className={cx('row')}>
                        {state.users.map(item => (
                            <div
                                key={`user-${item.objectId}`}
                                className={cx('column')}>
                                <Link
                                    to={`/admin/user/${item.objectId}`}
                                    className={cn(cx('card'), 'link')}>
                                    <Avatar
                                        user={item}
                                        className={cx('card-avatar')}
                                    />
                                    <span className={cx('card-title')}>
                                        {getName(item)}
                                    </span>

                                    <Role
                                        user={item}
                                        className={cx('card-role')}
                                    />

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

const Avatar = ({ user, className }) => {
    const image = useProfileAvatar(user);
    return (
        <div
            className={className}
            style={{ backgroundImage: `url(${image})` }}
        />
    );
};

const Role = ({ user, className }) => {
    const role = useProfileRole(user);
    return <div className={className}>{role}</div>;
};

const PlaceHolder = ({ cx }) => {
    return (
        <div className={cx('row')}>
            {_.times(12, index => (
                <div key={`placeholder-${index}`} className={cx('column')}>
                    <div className={cx('card')}>
                        <div className={cn(cx('card-avatar'), 'placeholder')} />
                        <span className={cn(cx('card-title'), 'placeholder')} />
                        <div className={cn(cx('card-role'), 'placeholder')} />
                        <span className={cn(cx('card-email'), 'placeholder')} />
                    </div>
                </div>
            ))}
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
