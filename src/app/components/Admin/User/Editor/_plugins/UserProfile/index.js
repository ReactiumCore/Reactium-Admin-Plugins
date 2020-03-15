import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Password from '../Password';
import useAvatar from 'components/Admin/User/useAvatar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Dropdown, Icon, Scene } from '@atomic-reactor/reactium-ui';

import Reactium, {
    __,
    useAsyncEffect,
    useRoles,
    Zone,
} from 'reactium-core/sdk';

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

const Email = ({ className, ...user }) => {
    return (
        <div className={cn(className, 'text-xs-center', 'text-sm-left')}>
            {op.get(user, 'email')}
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

const RoleSelect = ({ editor, ...user }) => {
    const ref = useRef();
    const roles = useRoles() || {};
    const isHidden = () => {
        if (editor.isNew()) return true;
        if (!op.has(user, 'objectId')) return true;

        return Reactium.User.isCurrent(user);
    };

    useEffect(() => {
        if (!ref.current || isHidden()) return;
        let r = Object.keys(op.get(user, 'roles', {}));

        if (r.length > 0) {
            ref.current.setState({ selection: r });
        }
    });

    const onItemSelect = async e => {
        if (editor.isDirty()) {
            await Reactium.User.save(editor.state.value);
        }
        const u = await Reactium.User.Role.add(e.item.name, user.objectId);
        editor.setState({ value: u });
        editor.dispatch('user-role-add', { role: e.item.name, user: u });
        editor.dispatch('status', {
            event: 'user-role-add',
            role: e.item.name,
            user: u,
        });
    };

    const onItemUnselect = async e => {
        if (editor.isDirty()) {
            await Reactium.User.save(editor.state.value);
        }
        const u = await Reactium.User.Role.remove(e.item.name, user.objectId);
        editor.setState({ value: u });
        editor.dispatch('user-role-remove', { role: e.item.name, user: u });
        editor.dispatch('status', {
            event: 'user-role-remove',
            role: e.item.name,
            user: u,
        });
    };

    return isHidden() ? null : (
        <Dropdown
            align={Dropdown.ENUMS.ALIGN.RIGHT}
            checkbox
            data={Object.values(roles)}
            maxHeight='calc(100vh - 150px)'
            multiSelect
            onItemSelect={onItemSelect}
            onItemUnselect={onItemUnselect}
            ref={ref}
            valueField='name'>
            <div className='flex middle'>
                <Button
                    type='button'
                    color={Button.ENUMS.COLOR.TERTIARY}
                    data-dropdown-element
                    style={{ height: 41, width: 41, padding: 0 }}>
                    <Icon name='Feather.Award' size={18} />
                </Button>
            </div>
        </Dropdown>
    );
};

const Inputs = ({ editing, editor, ...value }) => {
    return !editing ? null : (
        <div>
            <div className={cn(editor.cx('inputs'), 'row', 'mt-md-40')}>
                <div className='col-xs-12 mb-xs-16 pb-xs-16 flex middle border-bottom'>
                    <Icon name='Linear.Profile' className='mr-xs-16' />
                    <h2>{__('Profile Information')}</h2>
                </div>
                <div className='col-xs-12 col-sm-6 pr-xs-0 pr-sm-8 mb-xs-20'>
                    <div className='form-group'>
                        <input
                            type='text'
                            name='fname'
                            placeholder={__('First Name')}
                        />
                    </div>
                </div>
                <div className='col-xs-12 col-sm-6 pl-xs-0 pl-sm-8 mb-xs-20'>
                    <div className='form-group'>
                        <input
                            type='text'
                            name='lname'
                            placeholder={__('Last Name')}
                        />
                    </div>
                </div>
                <Zone zone={editor.cx('inputs-profile')} />
            </div>
            <div className={cn(editor.cx('inputs'), 'row')}>
                <div className='col-xs-12 mb-xs-16 pb-xs-16 flex middle border-bottom'>
                    <Icon name='Linear.License2' className='mr-xs-16' />
                    <h2>{__('Account Information')}</h2>
                </div>
                <div className='col-xs-12'>
                    <div
                        className={cn('form-group', {
                            'input-group': !Reactium.User.isCurrent(value),
                        })}>
                        <input
                            type='email'
                            name='email'
                            placeholder={__('Email')}
                            style={{ marginTop: 0 }}
                        />
                        <RoleSelect editor={editor} {...value} />
                    </div>
                    {editor.isNew() && (
                        <div className='form-group'>
                            <input
                                type='text'
                                name='username'
                                placeholder={__('Username')}
                            />
                        </div>
                    )}
                    {(editor.isNew() || Reactium.User.isCurrent(value)) && (
                        <>
                            <div className='form-group'>
                                <input
                                    type='password'
                                    name='password'
                                    placeholder={__('Password')}
                                />
                            </div>
                            <div className='form-group'>
                                <input
                                    type='password'
                                    placeholder={__('Confirm')}
                                />
                            </div>
                        </>
                    )}
                </div>
                <Zone zone={editor.cx('inputs-account')} />
            </div>
            <div className={cn(editor.cx('inputs'), 'row')}>
                <Zone zone={editor.cx('inputs')} />
                {!editor.isNew() && !Reactium.User.isCurrent(value) && (
                    <Password className='col-xs-12' user={value} />
                )}
            </div>
        </div>
    );
};

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

export default ({ editor, ...props }) => {
    const uploadRef = useRef();

    const { cx, isNew, setState, state = {}, submit, unMounted } = editor;
    const { editing = false, value = {} } = state;
    const [avatar] = useAvatar(value);

    const onFileSelected = async e => {
        if (e.target.files.length < 1) return;

        const data = await fileReader(_.last(e.target.files));

        op.set(value, 'avatar', data);

        setState({ value });

        uploadRef.current.value = null;
    };

    const onClearAvatar = () => {
        op.set(value, 'avatar', null);
        setState({ value });
    };

    const toggleEditMode = e => {
        e.currentTarget.blur();
        setState({ editing: !editing });
    };

    const Avatar = useCallback(() => (
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
                    <input type='hidden' name='avatar' />
                    <Button
                        appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                        onClick={() => uploadRef.current.click()}
                        size={Button.ENUMS.SIZE.XS}>
                        <Icon
                            name={
                                editor.isNew()
                                    ? 'Feather.Plus'
                                    : 'Feather.Edit2'
                            }
                            size={16}
                        />
                    </Button>
                    {!editor.isNew() && (
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
    ));

    const Info = useCallback(
        () => (
            <div className={cx('profile-info')}>
                {isNew() ? (
                    <div className='text-xs-center text-sm-left'>
                        <div>{__('Enter user information')}</div>
                        <small>
                            You can add the user to a role after the initial
                            save
                        </small>
                    </div>
                ) : (
                    <>
                        <Fullname
                            {...value}
                            className={cx('profile-info-name')}
                        />

                        <Email
                            {...value}
                            className={cx('profile-info-email')}
                        />

                        <Roles {...value} className={cx('profile-info-role')} />
                    </>
                )}
            </div>
        ),
        [value],
    );

    const Actions = useCallback(() => (
        <div className={cx('profile-actions')}>
            {!editor.isNew() && (
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
        </div>
    ));

    const render = () => {
        return (
            <>
                <div className={cn(cx('profile'), { 'edit-mode': editing })}>
                    <Avatar />
                    <Info />
                    <Actions />
                </div>
                <Inputs editing={editing} editor={editor} {...value} />
            </>
        );
    };

    return render();
};
