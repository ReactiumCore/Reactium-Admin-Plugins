import _ from 'underscore';
import op from 'object-path';
import { useState, useEffect } from 'react';
import Reactium, { useAsyncEffect } from '@atomic-reactor/reactium-core/sdk';

/**
 * @api {ReactHook} useAvatar(user) useAvatar()
 * @apiDescription React Hook that gets the avatar or default avatar of the supplied user.
 * @apiName useAvatar
 * @apiGroup ReactHook
 * @apiParam {Object} [user] The user object.
 */

const defaultAvatar = '/assets/images/avatar.png';

const useAvatar = (initialUser = {}) => {
    const [avatar, setAvatar] = useState(
        op.get(initialUser, 'avatar', defaultAvatar),
    );
    const [user, setUser] = useState(initialUser);
    const getAvatar = () => {
        const newAvatar = op.get(user, 'avatar', defaultAvatar);
        return newAvatar === null ? defaultAvatar : newAvatar;
    };

    useAsyncEffect(async (mounted) => {
        const context = await Reactium.Hook.run('profile-avatar', avatar, user);

        if (!mounted()) return;
        const newAvatar = op.get(context, 'avatar') || getAvatar();
        setAvatar(newAvatar);

        return () => {};
    });

    useEffect(() => {
        if (_.isEqual(user, initialUser)) return;
        setUser(initialUser);
    }, [initialUser]);

    return [avatar, setAvatar];
};

export { useAvatar, useAvatar as default };
