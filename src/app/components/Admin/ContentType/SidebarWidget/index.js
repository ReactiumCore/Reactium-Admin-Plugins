import React from 'react';
import { __, useHookComponent, Zone } from 'reactium-core/sdk';

export default () => {
    const MenuItem = useHookComponent('MenuItem');

    return (
        <MenuItem label={__('Content Types')} icon='Linear.Typewriter'>
            <Zone zone={'admin-sidebar-types'} />
            <MenuItem
                label={__('New')}
                icon='Linear.PlusSquare'
                route='/admin/type/new'
            />
        </MenuItem>
    );
};
