import _ from 'underscore';
import op from 'object-path';
import Reactium from 'reactium-core/sdk';
import { useRef, useState, useEffect } from 'react';

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

const useAvatar = user => {
    user = user || Reactium.User.current() || {};

    const ref = useRef(op.get(user, 'avatar', '/assets/images/hero.png'));
    const [, updateRef] = useState(ref.current);

    const setState = avatar => {
        if (avatar !== ref.current) {
            ref.current = avatar;
            updateRef(ref.current);
        }
    };

    useEffect(() => {
        Reactium.Hook.run('avatar', ref.current, user).then(context =>
            setState(op.get(context, 'avatar', ref.current)),
        );
    }, [op.get(user, 'objectId')]);

    return ref.current;
};

const useGreeting = user => {
    user = user || Reactium.User.current() || {};

    const ref = useRef();

    const [, updateRef] = useState(ref.current);

    const setState = greeting => {
        if (greeting !== ref.current) {
            ref.current = greeting;
            updateRef(ref.current);
        }
    };

    useEffect(() => {
        Reactium.Setting.get('admin.sidebar.greeting')
            .then(greeting => {
                const role = getRole(user);
                const name = op.get(user, 'fname', role);

                greeting = greeting || 'Hello';
                greeting = _.compact([greeting, name]).join(' ');

                setState(greeting);
                return greeting;
            })
            .then(() => {
                Reactium.Hook.run('admin-greeting', ref.current, user).then(
                    context => {
                        const { greeting } = context;
                        setState(greeting || ref.current);
                    },
                );
            });
    }, [op.get(user, 'objectId')]);

    return ref.current;
};

const useRole = user => {
    user = user || Reactium.User.current() || {};

    const ref = useRef(op.get(user, 'role'));
    const [, updateRef] = useState(ref.current);

    const setState = newState => {
        if (newState !== ref.current) {
            ref.current = newState;
            updateRef(ref.current);
        }
    };

    useEffect(() => {
        if (!ref.current) {
            setState(getRole(user));
        }

        Reactium.Hook.run('role-name', ref.current, user).then(context => {
            const { role } = context;
            setState(role || ref.current);
        });
    }, [op.get(user, 'objectId')]);

    return ref.current;
};

export { useAvatar, useGreeting, useRole };
