import React from 'react';
import { __ } from 'reactium-core/sdk';
import { Button, Icon } from 'reactium-ui';
import useRouteParams from 'reactium_modules/@atomic-reactor/reactium-admin-core/Tools/useRouteParams';

export default () => {
    const { path, page, id } = useRouteParams(['path', 'page', 'id']);
    const visible = String(path).startsWith('/admin/user');
    return (
        visible && (
            <ul className='ar-breadcrumbs'>
                <li>
                    <Button
                        className='px-0'
                        color='clear'
                        size='sm'
                        to='/admin/users/page/1'
                        type='link'>
                        <Icon name='Linear.Users2' className='mr-xs-12' />
                        {__('Users')}
                    </Button>
                </li>
                {id && id !== 'new' && <li>{id}</li>}
                {id && id !== 'new' && (
                    <li>
                        <Button
                            className='px-0'
                            color='clear'
                            size='sm'
                            to='/admin/user/new'
                            type='link'>
                            <Icon
                                name='Feather.Plus'
                                className='mr-xs-12'
                                size={16}
                            />
                        </Button>
                    </li>
                )}
            </ul>
        )
    );
};
