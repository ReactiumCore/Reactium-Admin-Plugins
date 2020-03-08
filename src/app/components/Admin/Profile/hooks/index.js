import _ from 'underscore';
import op from 'object-path';
import inputs from '../inputs';
import Reactium, { useAsyncEffect, useHandle } from 'reactium-core/sdk';
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

const noop = () => {
    return true;
};

/**
 * @api {ReactHook} useProfileAvatar(user) useProfileAvatar()
 * @apiDescription React Hook that gets the avatar or default avatar of the supplied user.
 * @apiName useProfileAvatar
 * @apiGroup ReactHook
 * @apiParam {Object} [user=Reactium.User.current] The user object. If an empty user object is supplied, the system default avatar will be used.
 */

const defaultAvatar = '/assets/images/avatar.png';

const useProfileAvatar = (initialUser = {}) => {
    const getAvatar = () => op.get(user, 'avatar', defaultAvatar);
    const [avatar, setAvatar] = useState();
    const [user, setUser] = useState(initialUser);

    // Reactium.User.current() ||

    useAsyncEffect(
        async mounted => {
            if (mounted() && avatar !== getAvatar()) {
                const context = await Reactium.Hook.run(
                    'profile-avatar',
                    avatar,
                    user,
                );
                const newAvatar = op.get(context, 'avatar') || getAvatar();
                setAvatar(newAvatar);
            }
            return () => {};
        },
        [user, op.get(user, 'avatar')],
    );

    useEffect(() => {
        if (_.isEqual(user, initialUser)) return;
        setUser(initialUser);
    }, [initialUser]);

    return avatar;
};

/**
 * @api {ReactHook} useProfileGreeting(user) useProfileGreeting()
 * @apiDescription React Hook that gets the profile greeting message.
 * @apiName useProfileGreeting
 * @apiGroup ReactHook
 * @apiParam {Object} [user=Reactium.User.current] The user object.
 */
const useProfileGreeting = user => {
    user = user || Reactium.User.current() || {};

    const ref = useRef('Hello');

    const [, updateRef] = useState(ref.current);

    const Profile = useHandle('ProfileEditor');

    const setState = greeting => {
        if (greeting !== ref.current) {
            ref.current = greeting;
            updateRef(ref.current);
        }
    };

    useEffect(() => {
        Reactium.Setting.get('admin.sidebar.greeting')
            .then(greeting => {
                const name = op.get(user, 'fname', user.username);

                greeting = greeting || 'Hello';
                greeting = _.compact([greeting, name]).join(' ');

                setState(greeting);
                return greeting;
            })
            .then(() => {
                Reactium.Hook.run('profile-greeting', ref.current, user).then(
                    context => {
                        const { greeting } = context;
                        setState(greeting || ref.current);
                    },
                );
            });
    }, [op.get(Profile, 'updated'), op.get(user, 'objectId')]);

    return ref.current;
};

/**
 * @api {ReactHook} userProfileInputs() userProfileInputs()
 * @apiDescription React Hook that gets the profile editor inputs.
 * @apiName useProfileINputs
 * @apiGroup ReactHook
 */
const useProfileInputs = () => {
    const initRef = useRef(false);
    const ref = useRef(Array.from(inputs));

    const [, updateRef] = useState(ref.current);

    const setState = newState => {
        ref.current = newState;
        updateRef(ref.current);
    };

    useEffect(() => {
        if (initRef.current === false) {
            initRef.current = true;
            Reactium.Hook.run('profile-inputs', ref.current).then(() =>
                setState(ref.current),
            );
        }
    }, [initRef.current]);

    return ref.current;
};

/**
 * @api {ReactHook} useProfileRole(user) useProfileRole()
 * @apiDescription React Hook that gets the profile role message.
 * @apiName useProfileRole
 * @apiGroup ReactHook
 * @apiParam {Object} [user=Reactium.User.current] The user object.
 */
const useProfileRole = initialUser => {
    const [role, setRole] = useState();
    const [user, setUser] = useState(initialUser);

    useAsyncEffect(
        async mounted => {
            if (role) {
                const context = await Reactium.Hook.run(
                    'profile-role-name',
                    role,
                    user,
                );

                if (mounted()) {
                    const newRole = op.get(context, 'role') || getRole(user);
                    setRole(newRole);
                }
            }
            return () => {};
        },
        [role, user, op.get(user, 'role')],
    );

    useEffect(() => {
        if (_.isEqual(user, initialUser)) return;
        setUser(initialUser);
    }, [initialUser]);

    useEffect(() => {
        setRole(getRole(user));
    }, [user]);

    return role;
};

export {
    useProfileAvatar,
    useProfileGreeting,
    useProfileInputs,
    useProfileRole,
};

/**
 * @api {Hook} profile-avatar profile-avatar
 * @apiDescription Customize the profile avatar displayed in the admin sidebar widget.
 * @apiName profile-avatar
 * @apiGroup Reactium.Hooks
 * @apiParam {String} avatar Valid HTML value for `<img />` src property.
 * @apiParam {Object} context The hook context object.
 * @apiExample Example Usage:
Reactium.Hook.register('profile-avatar', (avatar, context) => {
    context['avatar'] = '/path/to/different/avatar.jpg';
});
 */

/**
 * @api {Hook} profile-greeting profile-greeting
 * @apiDescription Customize the profile greeting displayed in the admin sidebar widget.
 * @apiName profile-greeting
 * @apiGroup Reactium.Hooks
 * @apiParam {String} greeting Custom greeting string. Default: `Hello [username]`.
 * @apiParam {Object} user The user object.
 * @apiParam {Object} context The hook context object.
 * @apiExample Example Usage:
Reactium.Hook.register('profile-greeting', (greeting, user, context) => {
    context['greeting'] = String(greeting).replace('Hello', '¡Hola') + '!';
}, Reactium.Enums.priority.lowest);
 */

/**
 * @api {Hook} profile-inputs profile-inputs
 * @apiDescription Customize the default input fields associated with the Profile Editor.
 * @apiName profile-inputs
 * @apiGroup Reactium.Hooks
 * @apiParam {Array} inputs Object array of input fields.

Input objects can contain any attribute associated with an `<input />`, `<textarea />`, or `<select />` element.
 * @apiParam {Object} context The hook context object.
 * @apiExample Example Usage:
// Add a new section heading:
Reactium.Hook.register('profile-inputs', (inputs, context) =>
    inputs.push({
        children: 'Test Heading', // valid PropType.node object.
        type: 'heading',
    }),
);

// Add a text input named "test" to the profile editor:
Reactium.Hook.register('profile-inputs', (inputs, context) =>
    inputs.push({
        autoComplete: 'off',
        name: 'test',
        placeholder: 'Test',
        type: 'text', // textarea and select are also valid.
    }),
);
*/

/**
 * @api {Hook} profile-role-name profile-role-name
 * @apiDescription Customize the profile role name displayed in the admin sidebar widget.
 * @apiName profile-role-name
 * @apiGroup Reactium.Hooks
 * @apiParam {String} greeting Custom greeting string. Default: `Hello [username]`.
 * @apiParam {Object} user The user object.
 * @apiParam {Object} context The hook context object.
 * @apiExample Example Usage:
Reactium.Hook.register('profile-role-name', (role, user, context) => {
    switch (role) {
        case 'super-admin':
            role = 'Super Admin';
            break;

        case 'administrator':
            role = 'Administrator';
            break;
    }
    context['role'] = role;

}, Reactium.Enums.priority.lowest);
 */
