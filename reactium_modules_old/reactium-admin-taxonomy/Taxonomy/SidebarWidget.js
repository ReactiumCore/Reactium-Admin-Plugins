import React from 'react';
import op from 'object-path';
import { __, useHookComponent } from 'reactium-core/sdk';

const isActive = (match = {}, location) =>
    String(op.get(match, 'url', '/'))
        .replace(/\\/gi, '')
        .toLowerCase()
        .startsWith('/admin/taxonomy');

export default () => {
    const MenuItem = useHookComponent('MenuItem');
    return (
        <MenuItem
            label={__('Taxonomy')}
            route='/admin/taxonomy'
            icon='Linear.Tag'
            isActive={isActive}
        />
    );
};
