import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import useAvatar from 'components/Admin/User/useAvatar';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Icon } from '@atomic-reactor/reactium-ui';

import Reactium, {
    __,
    useAsyncEffect,
    useRoles,
    Zone,
} from 'reactium-core/sdk';

const Actions = ({ editor }) => {
    const { cx, isNew, setState, state = {} } = editor;
    const { editing = false } = state;

    const toggleEditMode = e => {
        e.currentTarget.blur();
        setState({ editing: !editing });
    };

    return (
        <div className={cx('profile-actions')}>
            {!isNew() && (
                <Button
                    appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                    color={
                        editing
                            ? Button.ENUMS.COLOR.DANGER
                            : Button.ENUMS.COLOR.PRIMARY
                    }
                    onClick={e => toggleEditMode(e)}
                    outline={!editing}
                    size={Button.ENUMS.SIZE.XS}
                    style={{ width: 32, height: 32, padding: 0 }}>
                    <Icon
                        name={editing ? 'Feather.X' : 'Feather.Edit2'}
                        size={16}
                    />
                </Button>
            )}
            <Zone zone={cx('profile-actions')} editor={editor} />
        </div>
    );
};

const Avatar = ({ editor }) => {
    const { cx, isNew, refs, state = {} } = editor;
    const { editing = false, value = {} } = state;

    const [avatar, updateAvatar] = useAvatar(value);
    const [updated, forceUpdate] = useState(Date.now());
    const avatarRef = useRef();
    const uploadRef = useRef();

    const fileReader = file =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = () => {
                reader.abort();
                reject();
            };

            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });

    const onClearAvatar = () => {
        editor.setAvatar();
    };

    const onFileSelected = async e => {
        if (e.target.files.length < 1) return;
        const data = await fileReader(_.last(e.target.files));
        uploadRef.current.value = null;
        editor.setAvatar(data);
    };

    return (
        <div
            className={cx('profile-avatar')}
            style={{ backgroundImage: `url(${avatar})` }}>
            {editing && (
                <>
                    <input
                        type='file'
                        ref={uploadRef}
                        hidden
                        onChange={onFileSelected}
                    />
                    <Button
                        appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                        onClick={() => uploadRef.current.click()}
                        size={Button.ENUMS.SIZE.XS}>
                        <Icon
                            name={isNew() ? 'Feather.Plus' : 'Feather.Edit2'}
                            size={16}
                        />
                    </Button>
                    {op.get(value, 'avatar') && (
                        <Button
                            appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                            color={Button.ENUMS.COLOR.DANGER}
                            onClick={() => onClearAvatar()}
                            size={Button.ENUMS.SIZE.XS}>
                            <Icon name='Feather.X' size={18} />
                        </Button>
                    )}
                </>
            )}
        </div>
    );
};

const Email = ({ className, ...user }) => {
    return (
        <div className={cn(className, 'text-xs-center', 'text-sm-left')}>
            {op.get(user, 'email')}
        </div>
    );
};

const Fullname = ({ className, ...user }) => {
    const { fname, lname, username } = user;
    const [name, setName] = useState(_.compact([fname, lname]).join(' '));

    useAsyncEffect(
        async mounted => {
            let currentName = name;
            await Reactium.Hook.run('user-fullname', currentName, user);
            if (!mounted()) return;
            if (name !== currentName) setName(currentName);
        },
        [user],
    );

    useEffect(() => {
        const currentName = _.compact([fname, lname]).join(' ');
        if (name !== currentName) setName(_.compact([fname, lname]).join(' '));
    }, [user]);

    return (
        <div className={cn(className, 'text-xs-center', 'text-sm-left')}>
            {name}
        </div>
    );
};

const Info = ({ editor }) => {
    const { cx, isNew, state = {} } = editor;
    const { value } = state;

    return (
        <div className={cx('profile-info')}>
            {isNew() ? (
                <div className='text-xs-center text-sm-left'>
                    <div>{__('Enter user information')}</div>
                    <small>
                        You can add the user to a role after the initial save
                    </small>
                </div>
            ) : (
                <>
                    <Fullname {...value} className={cx('profile-info-name')} />
                    <Email {...value} className={cx('profile-info-email')} />
                    <Username
                        {...value}
                        className={cx('profile-info-username')}
                    />
                    <Roles {...value} className={cx('profile-info-role')} />
                </>
            )}
            <Zone zone={cx('profile-info')} editor={editor} />
        </div>
    );
};

const Roles = ({ className, ...user }) => {
    let roles = useRoles() || {};
    roles = _.indexBy(Object.values(roles), 'name');
    let names = Object.keys(op.get(user, 'roles', {}));
    names = names.length > 1 ? _.without(names, 'anonymous') : names;
    names.sort();
    const userRoles = names.map(name => op.get(roles, [name, 'label']));

    return (
        <div className={cn(`${className}s`, 'text-xs-center', 'text-sm-left')}>
            {userRoles.map((role, i) => (
                <span key={`role-${i}`} className={className}>
                    {role}
                </span>
            ))}
        </div>
    );
};

const Username = ({ className, ...user }) => (
    <div className={className}>{user.username}</div>
);

const UserProfile = ({ editor }) => (
    <div
        className={cn(editor.cx('profile'), {
            'edit-mode': op.get(editor, 'state.editing', false),
        })}>
        <Avatar editor={editor} />
        <Info editor={editor} />
        <Actions editor={editor} />
    </div>
);

export { UserProfile, UserProfile as default };
