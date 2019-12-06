import React from 'react';
import op from 'object-path';
import { __ } from 'reactium-core/sdk';
import MenuItem from 'components/Admin/MenuItem';

const isActive = (match = {}, location) => {
    return String(op.get(location, 'pathname', '/'))
        .replace(/\\/gi, '')
        .startsWith('/admin/media');
};

export default () => (
    <MenuItem
        label={__('Media')}
        route='/admin/media/1'
        icon='Linear.Pictures'
        isActive={isActive}
    />
);
