import React from 'react';
import op from 'object-path';
import { __, useHookComponent } from '@atomic-reactor/reactium-core/sdk';

const isActive = (match = {}) =>
    String(op.get(match, 'url', '/'))
        .replace(/\\/gi, '')
        .toLowerCase()
        .startsWith('/admin/user');

export default () => {
    const MenuItem = useHookComponent('MenuItem');

    return (
        <MenuItem
            add='/admin/user/new/edit'
            exact={false}
            label={__('Users')}
            icon='Linear.Users2'
            isActive={isActive}
            route='/admin/users/page/1'
        />
    );
};
