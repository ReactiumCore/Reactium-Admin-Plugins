import React from 'react';
import op from 'object-path';
import { __ } from 'reactium-core/sdk';
import MenuItem from 'components/Admin/registered-components/MenuItem';

const isActive = (match = {}, location) =>
    String(op.get(location, 'pathname', '/'))
        .replace(/\\/gi, '')
        .toLowerCase()
        .startsWith('/admin/media');

export default () => (
    <MenuItem
        label={__('Media')}
        route='/admin/media/1'
        icon='Linear.Pictures'
        isActive={isActive}
    />
);
