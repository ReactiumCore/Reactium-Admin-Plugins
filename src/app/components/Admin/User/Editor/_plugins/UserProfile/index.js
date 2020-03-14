import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import Reactium, { __, useAsyncEffect, useRoles } from 'reactium-core/sdk';
import useAvatar from 'components/Admin/User/useAvatar';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, Icon, Scene } from '@atomic-reactor/reactium-ui';

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
    const isMe = () => Reactium.User.isCurrent(user);

    useEffect(() => {
        if (!ref.current || isMe()) return;
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

    return (!op.has(user, 'objectId') && !editor.isNew()) ||
        isMe() === true ? null : (
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
    const sceneRef = useRef();
    const uploadRef = useRef();

    const { cx, setState, state = {}, submit, unMounted } = editor;
    const { editing = false } = state;
    const value = op.get(state, 'value');
    const [avatar] = useAvatar(value);

    // console.log(value);

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
        e.target.blur();

        const panel =
            sceneRef.current.active() === 'overview' ? 'edit' : 'overview';
        const direction =
            panel === 'overview'
                ? Scene.ENUMS.DIRECTION.IN
                : Scene.ENUMS.DIRECTION.OUT;

        sceneRef.current.navTo({
            panel,
            direction,
            animation: Scene.ENUMS.ANIMATION.FADE,
        });
    };

    const sceneChange = e => {
        if (unMounted()) return;
        setState({ editing: e.active !== 'overview' });
    };

    const render = () => {
        return (
            <div className={cn(cx('profile'), { 'edit-mode': editing })}>
                <input
                    type='file'
                    ref={uploadRef}
                    hidden
                    onChange={onFileSelected}
                />
                <input type='hidden' name='avatar' />
                <div
                    className={cx('profile-avatar')}
                    style={{ backgroundImage: `url(${avatar})` }}>
                    <Button
                        appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                        color={Button.ENUMS.COLOR.DANGER}
                        onClick={() => onClearAvatar()}
                        size={Button.ENUMS.SIZE.XS}>
                        <Icon name='Feather.X' size={18} />
                    </Button>
                    <Button
                        appearance={Button.ENUMS.APPEARANCE.CIRCLE}
                        onClick={() => uploadRef.current.click()}
                        size={Button.ENUMS.SIZE.XS}>
                        <Icon name='Feather.Edit2' size={16} />
                    </Button>
                </div>
                <div className={cx('profile-info')}>
                    <Scene
                        active={editing ? 'edit' : 'overview'}
                        height='auto'
                        width='100%'
                        ref={sceneRef}
                        onChange={sceneChange}>
                        <div className={cx('profile-info-scene')} id='overview'>
                            <div>
                                <Fullname
                                    {...value}
                                    className={cx('profile-info-name')}
                                />

                                <Email
                                    {...value}
                                    className={cx('profile-info-email')}
                                />

                                <Roles
                                    {...value}
                                    className={cx('profile-info-role')}
                                />
                            </div>
                        </div>
                        <div className={cx('profile-info-scene')} id='edit'>
                            <div className='row p-xs-4'>
                                <div className='col-xs-12 col-lg-6'>
                                    <div className='row'>
                                        <div className='col-xs-12 col-sm-6 pr-sm-12 pb-xs-12 pb-sm-0'>
                                            <div className='form-group'>
                                                <input
                                                    type='text'
                                                    name='fname'
                                                    placeholder='First'
                                                    id='fname'
                                                />
                                            </div>
                                        </div>
                                        <div className='col-xs-12 col-sm-6 pb-xs-12'>
                                            <div className='form-group'>
                                                <input
                                                    type='text'
                                                    name='lname'
                                                    placeholder='Last'
                                                />
                                            </div>
                                        </div>
                                        <div className='col-xs-12 mb-xs-4'>
                                            <div className='form-group'>
                                                <div className='input-group'>
                                                    <input
                                                        type='email'
                                                        name='email'
                                                        placeholder='Email'
                                                        style={{ marginTop: 0 }}
                                                    />
                                                    <RoleSelect
                                                        editor={editor}
                                                        {...value}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Scene>
                </div>
                <div className={cx('profile-actions')}>
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
                </div>
            </div>
        );
    };

    return render();
};
