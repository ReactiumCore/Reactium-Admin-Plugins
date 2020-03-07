import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef, useState } from 'react';
import { useProfileAvatar } from 'components/Admin/Profile/hooks';
import Reactium, { useDerivedState, useSelect } from 'reactium-core/sdk';

const Avatar = ({ user, className }) => {
    const image = useProfileAvatar(user);
    return (
        <div
            className={className}
            style={{ backgroundImage: `url(${image})` }}
        />
    );
};

const ENUMS = {
    STATUS: {
        INIT: 'INIT',
        FETCHING: 'FETCHING',
        READY: 'READY',
    },
};

const UserList = ({ className, namespace, ...props }) => {
    const params = useSelect(state => op.get(state, 'Router.params'));

    const containerRef = useRef();

    const [page, setPage] = useState();

    const [status, setStatus] = useState(ENUMS.STATUS.INIT);

    const [users, setUsers] = useState();

    const cx = Reactium.Utils.cxFactory(namespace);

    const cname = () => cn(cx(), { [className]: !!className });

    // const [state, setNewState] = useDerivedState({
    //     page: op.get(params, 'page', 1),
    //     status: ENUMS.STATUS.INIT,
    //     users: undefined,
    // });

    const fetch = params => {
        setStatus(ENUMS.STATUS.FETCHING);
        return Reactium.User.list(params);
    };

    const isBusy = () => Boolean(status !== ENUMS.STATUS.READY);

    const isMounted = () => !!containerRef.current;

    const unMounted = () => !containerRef.current;

    useEffect(() => {
        if (status === ENUMS.STATUS.INIT) {
            fetch().then(({ results }) => {
                if (unMounted()) return;
                setUsers(results);
                setStatus(ENUMS.STATUS.READY);
            });
        }
    }, [op.get(params, 'page')]);

    const render = () => {
        return (
            <div className={cname()} ref={containerRef}>
                {!isBusy() && users && (
                    <div className={cx('row')}>
                        <div className={cx('column')}>
                            <div className={cx('card')}>CARD</div>
                        </div>
                        <div className={cx('column')}>
                            <div className={cx('card')}>CARD</div>
                        </div>
                        <div className={cx('column')}>
                            <div className={cx('card')}>CARD</div>
                        </div>
                        <div className={cx('column')}>
                            <div className={cx('card')}>CARD</div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return render();
};

UserList.defaultProps = {
    namespace: 'admin-user-list',
};

export default UserList;
