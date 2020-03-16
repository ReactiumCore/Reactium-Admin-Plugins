import _ from 'underscore';
import cn from 'classnames';
import op from 'object-path';
import React, { useEffect, useRef } from 'react';
import Reactium, { __, useRoles, Zone } from 'reactium-core/sdk';
import { Button, Dropdown, Icon } from '@atomic-reactor/reactium-ui';
import Password from 'components/Admin/User/Editor/_plugins/Password';

const UserInputs = ({ editor }) => {
    const { cx, errors, state = {} } = editor;
    const { value = {} } = state;

    const isError = field => {
        const errs = _.indexBy(errors, 'field');
        return op.get(errs, field, false);
    };

    return (
        <div>
            <input type='hidden' name='avatar' />
            {op.get(value, 'objectId') && (
                <input type='hidden' name='objectId' />
            )}
            <div className={cn(editor.cx('inputs'), 'row', 'mt-md-40')}>
                <div className='col-xs-12 mb-xs-16 pb-xs-16 flex middle border-bottom'>
                    <Icon name='Linear.Profile' className='mr-xs-16' />
                    <h2>{__('Profile Information')}</h2>
                </div>
                <div className='col-xs-12 col-sm-6 pr-xs-0 pr-sm-8 mb-xs-20'>
                    <div
                        className={cn('form-group', {
                            error: isError('fname'),
                        })}>
                        <input
                            type='text'
                            name='fname'
                            placeholder={__('First Name')}
                        />
                    </div>
                </div>
                <div className='col-xs-12 col-sm-6 pl-xs-0 pl-sm-8 mb-xs-20'>
                    <div
                        className={cn('form-group', {
                            error: isError('lname'),
                        })}>
                        <input
                            type='text'
                            name='lname'
                            placeholder={__('Last Name')}
                        />
                    </div>
                </div>
                <Zone zone={editor.cx('inputs-profile')} editor={editor} />
            </div>
            <div className={cn(editor.cx('inputs'), 'row')}>
                <div className='col-xs-12 mb-xs-16 pb-xs-16 flex middle border-bottom'>
                    <Icon name='Linear.License2' className='mr-xs-16' />
                    <h2>{__('Account Information')}</h2>
                </div>
                <div className='col-xs-12'>
                    <div
                        className={cn('form-group', {
                            error: isError('email'),
                            'input-group':
                                !Reactium.User.isCurrent(value) &&
                                !editor.isNew(),
                        })}>
                        <input
                            type='email'
                            name='email'
                            placeholder={__('Email')}
                            style={{ marginTop: 0 }}
                        />
                        <RoleSelect editor={editor} />
                        {isError('email') && (
                            <small>{isError('email').message}</small>
                        )}
                    </div>
                    {editor.isNew() && (
                        <div
                            className={cn('form-group', {
                                error: isError('username'),
                            })}>
                            <input
                                type='text'
                                name='username'
                                placeholder={__('Username')}
                            />
                            {isError('email') && (
                                <small>{isError('username').message}</small>
                            )}
                        </div>
                    )}
                    {(editor.isNew() || Reactium.User.isCurrent(value)) && (
                        <>
                            <div
                                className={cn('form-group', {
                                    error: isError('password'),
                                })}>
                                <input
                                    type='password'
                                    name='password'
                                    placeholder={__('Password')}
                                />
                                {isError('password') && (
                                    <small>{isError('password').message}</small>
                                )}
                            </div>
                            <div
                                className={cn('form-group', {
                                    error: isError('confirm'),
                                })}>
                                <input
                                    type='password'
                                    name='confirm'
                                    placeholder={__('Confirm')}
                                />
                                {isError('confirm') && (
                                    <small>{isError('confirm').message}</small>
                                )}
                            </div>
                        </>
                    )}
                </div>
                <Zone zone={editor.cx('inputs-account')} editor={editor} />
            </div>
            <div className={cn(editor.cx('inputs'), 'row')}>
                <Zone zone={editor.cx('inputs')} editor={editor} />
                {!editor.isNew() && !Reactium.User.isCurrent(value) && (
                    <Password className='col-xs-12' user={value} />
                )}
            </div>
        </div>
    );
};

const RoleSelect = ({ editor }) => {
    const ref = useRef();
    const roles = useRoles() || {};
    const user = op.get(editor, 'state.value', {});

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

export { UserInputs, UserInputs as default, RoleSelect };
